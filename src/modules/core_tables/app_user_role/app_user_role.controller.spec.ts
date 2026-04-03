import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppUserRoleController } from './app_user_role.controller';
import { AppUserRoleService } from './app_user_role.service';
import { AppUserRole } from './entities/appUserRole.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockAppUserRoleService = {
  create: jest.fn(),
  findAllWithRelations: jest.fn(),
  findRolesByUserId: jest.fn(),
  removeUserRole: jest.fn(),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const makeUserRole = (overrides = {}): AppUserRole => ({
  id: 1,
  appUser: { id: 1 } as any,
  role: { id: 1 } as any,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: null as any,
  updated_by: null as any,
  ...overrides,
} as unknown as AppUserRole);

describe('AppUserRoleController', () => {
  let controller: AppUserRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUserRoleController],
      providers: [
        {
          provide: AppUserRoleService,
          useValue: mockAppUserRoleService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<AppUserRoleController>(AppUserRoleController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // create()
  // ─────────────────────────────────────────────
  describe('create', () => {
    const dto = { appUser: { id: 1 }, role: { id: 1 } };

    it('should assign role to user and return result', async () => {
      const created = makeUserRole();
      mockAppUserRoleService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(result).toEqual(created);
      expect(mockAppUserRoleService.create).toHaveBeenCalledWith(dto);
      expect(mockAppUserRoleService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when combo already exists', async () => {
      mockAppUserRoleService.create.mockRejectedValue(
        new BadRequestException('User 1 already has role 1'),
      );

      await expect(controller.create(dto as any)).rejects.toThrow(BadRequestException);
      await expect(controller.create(dto as any)).rejects.toThrow(
        'User 1 already has role 1',
      );
    });
  });

  // ─────────────────────────────────────────────
  // findAll()
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all user role mappings', async () => {
      const mappings = [makeUserRole(), makeUserRole({ id: 2 })];
      mockAppUserRoleService.findAllWithRelations.mockResolvedValue(mappings);

      const result = await controller.findAll();

      expect(result).toEqual(mappings);
      expect(mockAppUserRoleService.findAllWithRelations).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no mappings exist', async () => {
      mockAppUserRoleService.findAllWithRelations.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findRolesByUserId()
  // ─────────────────────────────────────────────
  describe('findRolesByUserId', () => {
    it('should return all roles for a specific user', async () => {
      const mappings = [makeUserRole(), makeUserRole({ id: 2, role: { id: 2 } })];
      mockAppUserRoleService.findRolesByUserId.mockResolvedValue(mappings);

      const result = await controller.findRolesByUserId(1);

      expect(result).toEqual(mappings);
      expect(mockAppUserRoleService.findRolesByUserId).toHaveBeenCalledWith(1);
      expect(mockAppUserRoleService.findRolesByUserId).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when user has no roles', async () => {
      mockAppUserRoleService.findRolesByUserId.mockResolvedValue([]);

      const result = await controller.findRolesByUserId(99);

      expect(result).toEqual([]);
    });
  });
});