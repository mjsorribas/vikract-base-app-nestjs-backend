import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { ApiKey } from './entities/api-key.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(userId: string, createApiKeyDto: CreateApiKeyDto): Promise<{ apiKey: ApiKey; plainToken: string }> {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que no existe un token con el mismo nombre para este usuario
    const existingKey = await this.apiKeyRepository.findOne({
      where: { 
        name: createApiKeyDto.name,
        userId: userId,
        deletedAt: null 
      }
    });

    if (existingKey) {
      throw new ConflictException(`Ya existe una API Key con el nombre "${createApiKeyDto.name}"`);
    }

    // Generar token JWT
    const payload = {
      sub: userId,
      type: 'api_key',
      keyId: crypto.randomUUID(),
      scopes: createApiKeyDto.scopes || []
    };

    const plainToken = this.jwtService.sign(payload, {
      expiresIn: createApiKeyDto.expiresAt ? undefined : '365d' // 1 año por defecto
    });

    // Crear hash del token para almacenar en BD
    const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');

    // Crear la API Key en la base de datos
    const apiKey = this.apiKeyRepository.create({
      ...createApiKeyDto,
      token: hashedToken,
      userId: userId,
      user: user,
    });

    const savedApiKey = await this.apiKeyRepository.save(apiKey);

    return {
      apiKey: savedApiKey,
      plainToken: plainToken // Solo se devuelve una vez al crear
    };
  }

  async findAll(): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      relations: ['user'],
      where: { deletedAt: null },
      order: { createdAt: 'DESC' }
    });
  }

  async findByUser(userId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      where: { 
        userId: userId,
        deletedAt: null 
      },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['user']
    });

    if (!apiKey) {
      throw new NotFoundException('API Key no encontrada');
    }

    return apiKey;
  }

  async validateToken(token: string): Promise<{ user: User; apiKey: ApiKey } | null> {
    try {
      // Verificar y decodificar el JWT
      const decoded = this.jwtService.verify(token);
      
      if (decoded.type !== 'api_key') {
        return null;
      }

      // Crear hash del token recibido
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Buscar la API Key en la base de datos
      const apiKey = await this.apiKeyRepository.findOne({
        where: { 
          token: hashedToken,
          isActive: true,
          deletedAt: null 
        },
        relations: ['user']
      });

      if (!apiKey) {
        return null;
      }

      // Verificar expiración manual si está configurada
      if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
        return null;
      }

      // Actualizar último uso
      await this.updateLastUsed(apiKey.id);

      return {
        user: apiKey.user,
        apiKey: apiKey
      };
    } catch (error) {
      // Token inválido o expirado
      return null;
    }
  }

  async update(id: string, updateApiKeyDto: UpdateApiKeyDto): Promise<ApiKey> {
    const apiKey = await this.findOne(id);
    
    Object.assign(apiKey, updateApiKeyDto);
    return this.apiKeyRepository.save(apiKey);
  }

  async deactivate(id: string): Promise<ApiKey> {
    const apiKey = await this.findOne(id);
    apiKey.isActive = false;
    return this.apiKeyRepository.save(apiKey);
  }

  async remove(id: string): Promise<void> {
    const apiKey = await this.findOne(id);
    await this.apiKeyRepository.softDelete(id);
  }

  private async updateLastUsed(id: string, ip?: string): Promise<void> {
    await this.apiKeyRepository.update(id, {
      lastUsedAt: new Date(),
      lastUsedIp: ip
    });
  }

  async cleanupExpiredKeys(): Promise<number> {
    const result = await this.apiKeyRepository
      .createQueryBuilder()
      .softDelete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }
}