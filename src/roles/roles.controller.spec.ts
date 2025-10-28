import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRole = {
    id: '1',
    name: 'admin',
    description: 'Administrator role',
    permissions: ['read', 'write', 'delete'],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto = {
        name: 'editor',
        description: 'Editor role',
        permissions: ['read', 'write'],
      };

      const newRole = { ...mockRole, ...createRoleDto, id: '2' };
      mockRolesService.create.mockResolvedValue(newRole);

      const result = await controller.create(createRoleDto);

      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(newRole);
    });

    it('should handle creation errors', async () => {
      const createRoleDto = {
        name: 'duplicate',
        description: 'Duplicate role',
        permissions: ['read'],
      };

      mockRolesService.create.mockRejectedValue(
        new Error('Role name already exists'),
      );

      await expect(controller.create(createRoleDto)).rejects.toThrow(
        'Role name already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        mockRole,
        { ...mockRole, id: '2', name: 'editor', description: 'Editor role' },
      ];
      mockRolesService.findAll.mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no roles exist', async () => {
      mockRolesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a single role', async () => {
      mockRolesService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockRole);
    });

    it('should return null when role not found', async () => {
      mockRolesService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(service.findOne).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateRoleDto = {
        description: 'Updated admin role',
        permissions: ['read', 'write', 'delete', 'admin'],
      };

      const updatedRole = { ...mockRole, ...updateRoleDto };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update('1', updateRoleDto);

      expect(service.update).toHaveBeenCalledWith('1', updateRoleDto);
      expect(result).toEqual(updatedRole);
    });

    it('should handle partial updates', async () => {
      const updateRoleDto = {
        description: 'Only description updated',
      };

      const updatedRole = {
        ...mockRole,
        description: 'Only description updated',
      };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update('1', updateRoleDto);

      expect(result.description).toBe('Only description updated');
      expect(result.name).toBe(mockRole.name); // Unchanged
    });
  });

  describe('remove', () => {
    it('should soft delete a role', async () => {
      mockRolesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });

    it('should handle removal errors', async () => {
      mockRolesService.remove.mockRejectedValue(
        new Error('Cannot delete role with assigned users'),
      );

      await expect(controller.remove('1')).rejects.toThrow(
        'Cannot delete role with assigned users',
      );
    });
  });

  describe('validation scenarios', () => {
    it('should validate role name format', async () => {
      const createRoleDto = {
        name: 'invalid name with spaces',
        description: 'Invalid role',
        permissions: ['read'],
      };

      mockRolesService.create.mockRejectedValue(
        new Error('Invalid role name format'),
      );

      await expect(controller.create(createRoleDto)).rejects.toThrow(
        'Invalid role name format',
      );
    });

    it('should prevent duplicate role names', async () => {
      const createRoleDto = {
        name: 'admin',
        description: 'Another admin role',
        permissions: ['read'],
      };

      mockRolesService.create.mockRejectedValue(
        new Error('Role name already exists'),
      );

      await expect(controller.create(createRoleDto)).rejects.toThrow(
        'Role name already exists',
      );
    });

    it('should validate permissions array', async () => {
      const createRoleDto = {
        name: 'invalidrole',
        description: 'Role with invalid permissions',
        permissions: [], // Empty permissions
      };

      mockRolesService.create.mockRejectedValue(
        new Error('At least one permission is required'),
      );

      await expect(controller.create(createRoleDto)).rejects.toThrow(
        'At least one permission is required',
      );
    });
  });
});
