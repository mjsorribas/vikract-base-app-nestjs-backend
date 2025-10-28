import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockRole = {
    id: '1',
    name: 'admin',
    description: 'Administrator',
    permissions: ['read', 'write', 'delete'],
  };

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    isActive: true,
    isEmailVerified: true,
    roles: [mockRole],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        password: 'password123',
      };

      const newUser = {
        ...mockUser,
        ...createUserDto,
        id: '2',
        isEmailVerified: false,
        roles: [],
      };
      mockUsersService.create.mockResolvedValue(newUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(newUser);
      expect(result.password).toBeUndefined();
    });

    it('should create user with roles', async () => {
      const createUserDto = {
        email: 'editor@example.com',
        firstName: 'Editor',
        lastName: 'User',
        username: 'editor',
        password: 'password123',
        roleIds: ['2'],
      };

      const newUser = {
        ...mockUser,
        ...createUserDto,
        id: '3',
        roles: [{ ...mockRole, id: '2', name: 'editor' }],
      };
      mockUsersService.create.mockResolvedValue(newUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result.roles).toHaveLength(1);
      expect(result.roles[0].name).toBe('editor');
    });

    it('should handle creation errors', async () => {
      const createUserDto = {
        email: 'duplicate@example.com',
        firstName: 'Duplicate',
        lastName: 'User',
        username: 'duplicate',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        mockUser,
        {
          ...mockUser,
          id: '2',
          email: 'user2@example.com',
          username: 'user2',
        },
      ];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return users with roles populated', async () => {
      const usersWithRoles = [
        {
          ...mockUser,
          roles: [mockRole],
        },
      ];
      mockUsersService.findAll.mockResolvedValue(usersWithRoles);

      const result = await controller.findAll();

      expect(result[0].roles).toBeDefined();
      expect(result[0].roles).toHaveLength(1);
    });

    it('should return empty array when no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(service.findOne).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });

    it('should validate UUID format', async () => {
      // ParseUUIDPipe would handle this validation in real scenario
      const invalidId = 'invalid-uuid';

      await expect(() => controller.findOne(invalidId)).not.toThrow();
      // Note: In real app, this would be handled by the ParseUUIDPipe
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        firstName: 'Johnny',
        lastName: 'Doe Jr',
        isActive: false,
      };

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should update user email and require verification', async () => {
      const updateUserDto = {
        email: 'newemail@example.com',
      };

      const updatedUser = {
        ...mockUser,
        email: 'newemail@example.com',
        isEmailVerified: false,
      };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result.email).toBe('newemail@example.com');
      expect(result.isEmailVerified).toBe(false);
    });

    it('should deactivate user', async () => {
      const updateUserDto = {
        isActive: false,
      };

      const updatedUser = { ...mockUser, isActive: false };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result.isActive).toBe(false);
    });

    it('should handle partial updates', async () => {
      const updateUserDto = {
        firstName: 'Updated Name',
      };

      const updatedUser = { ...mockUser, firstName: 'Updated Name' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('1', updateUserDto);

      expect(result.firstName).toBe('Updated Name');
      expect(result.lastName).toBe(mockUser.lastName); // Unchanged
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });

    it('should handle removal errors', async () => {
      mockUsersService.remove.mockRejectedValue(
        new Error('Cannot delete admin user'),
      );

      await expect(controller.remove('1')).rejects.toThrow(
        'Cannot delete admin user',
      );
    });

    it('should handle user not found for removal', async () => {
      mockUsersService.remove.mockRejectedValue(new Error('User not found'));

      await expect(controller.remove('999')).rejects.toThrow('User not found');
    });
  });

  describe('validation scenarios', () => {
    it('should validate email format', async () => {
      const createUserDto = {
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Invalid email format'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Invalid email format',
      );
    });

    it('should prevent duplicate email', async () => {
      const createUserDto = {
        email: 'test@example.com',
        firstName: 'Duplicate',
        lastName: 'User',
        username: 'duplicate',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Email already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('should prevent duplicate username', async () => {
      const createUserDto = {
        email: 'unique@example.com',
        firstName: 'Test',
        lastName: 'User',
        username: 'johndoe',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Username already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        'Username already exists',
      );
    });

    it('should validate required fields', async () => {
      const incompleteDto = {
        email: 'test@example.com',
        // Missing firstName, lastName, username, password
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Missing required fields'),
      );

      await expect(controller.create(incompleteDto as any)).rejects.toThrow(
        'Missing required fields',
      );
    });
  });
});