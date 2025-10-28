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
    createdAt: new Date(),
    updatedAt: new Date(),
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
        name: 'admin',
        description: 'Administrator role',
      };

      mockRolesService.create.mockResolvedValue(mockRole);

      const result = await controller.create(createRoleDto);

      expect(service.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(mockRole);
    });

    it('should handle service errors during creation', async () => {
      const createRoleDto = {
        name: 'admin',
        description: 'Administrator role',
      };

      mockRolesService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(controller.create(createRoleDto)).rejects.toThrow(
        'Creation failed',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const mockRoles = [mockRole];
      mockRolesService.findAll.mockResolvedValue(mockRoles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });

    it('should return empty array when no roles exist', async () => {
      mockRolesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
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

    it('should validate UUID parameter', async () => {
      mockRolesService.findOne.mockResolvedValue(mockRole);

      const result = await controller.findOne(
        '550e8400-e29b-41d4-a716-446655440000',
      );

      expect(service.findOne).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440000',
      );
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateRoleDto = {
        description: 'Updated description',
      };

      const updatedRole = { ...mockRole, description: 'Updated description' };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update('1', updateRoleDto);

      expect(service.update).toHaveBeenCalledWith('1', updateRoleDto);
      expect(result).toEqual(updatedRole);
    });

    it('should handle partial updates', async () => {
      const updateRoleDto = {
        name: 'editor',
      };

      const updatedRole = { ...mockRole, name: 'editor' };
      mockRolesService.update.mockResolvedValue(updatedRole);

      const result = await controller.update('1', updateRoleDto);

      expect(service.update).toHaveBeenCalledWith('1', updateRoleDto);
      expect(result).toEqual(updatedRole);
    });

    it('should handle update errors', async () => {
      const updateRoleDto = {
        description: 'Updated description',
      };

      mockRolesService.update.mockRejectedValue(new Error('Update failed'));

      await expect(controller.update('1', updateRoleDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      mockRolesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });

    it('should handle removal errors', async () => {
      mockRolesService.remove.mockRejectedValue(new Error('Removal failed'));

      await expect(controller.remove('1')).rejects.toThrow('Removal failed');
    });
  });
});
