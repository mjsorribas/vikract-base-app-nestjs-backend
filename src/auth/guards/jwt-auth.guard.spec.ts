import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeysService } from '../../api-keys/api-keys.service';
import { User } from '../../users/entities/user.entity';
import { ApiKey } from '../../api-keys/entities/api-key.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;
  let apiKeysService: ApiKeysService;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockApiKeysService = {
    validateToken: jest.fn(),
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
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        {
          provide: ApiKeysService,
          useValue: mockApiKeysService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
    apiKeysService = module.get<ApiKeysService>(ApiKeysService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    isPublic = false,
    authorizationHeader?: string,
  ): ExecutionContext => {
    const mockRequest = {
      headers: {
        authorization: authorizationHeader,
      },
    };

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => mockRequest),
      })),
    } as unknown as ExecutionContext;

    mockReflector.getAllAndOverride.mockReturnValue(isPublic);

    return mockContext;
  };

  describe('canActivate', () => {
    it('should allow access to public routes', async () => {
      // Arrange
      const context = createMockExecutionContext(true);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalled();
    });

    it('should allow access with valid API key', async () => {
      // Arrange
      const context = createMockExecutionContext(false, 'Bearer valid-api-key');
      const request = context.switchToHttp().getRequest();
      
      mockApiKeysService.validateToken.mockResolvedValue({
        user: mockUser,
        apiKey: mockApiKey,
      });

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(mockApiKeysService.validateToken).toHaveBeenCalledWith('valid-api-key');
      expect(request.user).toBe(mockUser);
      expect(request.apiKey).toBe(mockApiKey);
    });

    it('should deny access with invalid API key', async () => {
      // Arrange
      const context = createMockExecutionContext(false, 'Bearer invalid-api-key');
      
      mockApiKeysService.validateToken.mockResolvedValue(null);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(false);
      expect(mockApiKeysService.validateToken).toHaveBeenCalledWith('invalid-api-key');
    });

    it('should deny access without authorization header', async () => {
      // Arrange
      const context = createMockExecutionContext(false);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(false);
      expect(mockApiKeysService.validateToken).not.toHaveBeenCalled();
    });

    it('should deny access with malformed authorization header', async () => {
      // Arrange
      const context = createMockExecutionContext(false, 'InvalidFormat token');

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(false);
      expect(mockApiKeysService.validateToken).not.toHaveBeenCalled();
    });
  });
});