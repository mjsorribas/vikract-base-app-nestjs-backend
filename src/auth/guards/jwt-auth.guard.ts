import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private apiKeysService: ApiKeysService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // Si hay token, primero intentar validación JWT estándar
    if (token) {
      try {
        // Intentar autenticación JWT estándar primero
        const jwtResult = await super.canActivate(context);
        if (jwtResult) {
          return true;
        }
      } catch (error) {
        // Si falla JWT estándar, intentar con API Key
      }

      // Intentar validación como API Key
      const validation = await this.apiKeysService.validateToken(token);
      if (validation) {
        request.user = validation.user;
        request.apiKey = validation.apiKey;
        return true;
      }
    }

    return false;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}