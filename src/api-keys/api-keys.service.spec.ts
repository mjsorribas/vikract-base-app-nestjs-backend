import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKey } from './entities/api-key.entity';
import { User } from '../users/entities/user.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

describe('ApiKeysService', () => {
  let service: ApiKeysService;
  let apiKeyRepository: Repository<ApiKey>;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockApiKeyRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      softDelete: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    })),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    password: '$2b$10$hashedpassword',
    isActive: true,
    isEmailVerified: true,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockApiKey: ApiKey = {
    id: '456e7890-e89b-12d3-a456-426614174001',
    token: 'hashed-token',
    name: 'Test API Key',
    expiresAt: null,
    lastUsedAt: null,
    lastUsedIp: null,
    userAgent: null,
    scopes: [],
    isActive: true,
    notes: null,
    user: mockUser,
    userId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeysService,
        {
          provide: getRepositoryToken(ApiKey),
          useValue: mockApiKeyRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<ApiKeysService>(ApiKeysService);
    apiKeyRepository = module.get<Repository<ApiKey>>(getRepositoryToken(ApiKey));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createApiKeyDto: CreateApiKeyDto = {
      name: 'Test API Key',
      scopes: ['read:users'],
    };

    it('should create a new API key', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApiKeyRepository.findOne.mockResolvedValue(null);
      mockJwtService.sign.mockReturnValue('jwt-token');
      mockApiKeyRepository.create.mockReturnValue(mockApiKey);
      mockApiKeyRepository.save.mockResolvedValue(mockApiKey);

      // Act
      const result = await service.create(mockUser.id, createApiKeyDto);

      // Assert
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(mockApiKeyRepository.findOne).toHaveBeenCalledWith({
        where: {
          name: createApiKeyDto.name,
          userId: mockUser.id,
          deletedAt: null,
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalled();
      expect(result).toHaveProperty('apiKey');
      expect(result).toHaveProperty('plainToken');
    });

    it('should throw NotFoundException if user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create('non-existent-user', createApiKeyDto)).rejects.toThrow(
        new NotFoundException('Usuario no encontrado'),
      );
    });

    it('should throw ConflictException if API key name already exists', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      // Act & Assert
      await expect(service.create(mockUser.id, createApiKeyDto)).rejects.toThrow(
        new ConflictException(`Ya existe una API Key con el nombre "${createApiKeyDto.name}"`),
      );
    });
  });

  describe('validateToken', () => {
    it('should return user and apiKey for valid token', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const decodedPayload = {
        sub: mockUser.id,
        type: 'api_key',
        keyId: 'key-id',
        scopes: [],
      };

      mockJwtService.verify.mockReturnValue(decodedPayload);
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      // Act
      const result = await service.validateToken(token);

      // Assert
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        user: mockApiKey.user,
        apiKey: mockApiKey,
      });
    });

    it('should return null for invalid token', async () => {
      // Arrange
      const token = 'invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      const result = await service.validateToken(token);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for non-api_key token type', async () => {
      // Arrange
      const token = 'user-session-token';
      const decodedPayload = {
        sub: mockUser.id,
        type: 'user_session',
      };

      mockJwtService.verify.mockReturnValue(decodedPayload);

      // Act
      const result = await service.validateToken(token);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for expired API key', async () => {
      // Arrange
      const token = 'expired-token';
      const decodedPayload = {
        sub: mockUser.id,
        type: 'api_key',
        keyId: 'key-id',
        scopes: [],
      };
      const expiredApiKey = {
        ...mockApiKey,
        expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
      };

      mockJwtService.verify.mockReturnValue(decodedPayload);
      mockApiKeyRepository.findOne.mockResolvedValue(expiredApiKey);

      // Act
      const result = await service.validateToken(token);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return API key if found', async () => {
      // Arrange
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      // Act
      const result = await service.findOne(mockApiKey.id);

      // Assert
      expect(result).toEqual(mockApiKey);
    });

    it('should throw NotFoundException if API key not found', async () => {
      // Arrange
      mockApiKeyRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('API Key no encontrada'),
      );
    });
  });

  describe('deactivate', () => {
    it('should deactivate API key', async () => {
      // Arrange
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      const deactivatedApiKey = { ...mockApiKey, isActive: false };
      mockApiKeyRepository.save.mockResolvedValue(deactivatedApiKey);

      // Act
      const result = await service.deactivate(mockApiKey.id);

      // Assert
      expect(result.isActive).toBe(false);
      expect(mockApiKeyRepository.save).toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredKeys', () => {
    it('should clean up expired keys', async () => {
      // Arrange
      const mockQueryBuilder = {
        softDelete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 2 }),
      };
      mockApiKeyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.cleanupExpiredKeys();

      // Assert
      expect(result).toBe(2);
      expect(mockQueryBuilder.softDelete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });
});