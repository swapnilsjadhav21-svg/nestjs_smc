import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppUserRoleService } from './app_user_role.service';
import { AppUserRole } from './entities/appUserRole.entity';

const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
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

describe('AppUserRoleService', () => {
  let service: AppUserRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppUserRoleService,
        {
          provide: getRepositoryToken(AppUserRole),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AppUserRoleService>(AppUserRoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // create()
  // ─────────────────────────────────────────────
  describe('create', () => {
    const dto = {
      appUser: { id: 1 },
      role: { id: 1 },
    };

    it('should create user role when combo does not exist', async () => {
      const saved = makeUserRole();

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(saved);
      mockRepository.save.mockResolvedValue(saved);

      const result = await service.create(dto as any);

      expect(result).toEqual(saved);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when user-role combo already exists', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(makeUserRole())
        .mockResolvedValueOnce(makeUserRole());

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto as any)).rejects.toThrow(
        'User 1 already has role 1',
      );
    });

    it('should NOT call save when duplicate combo found', async () => {
      mockRepository.findOne.mockResolvedValue(makeUserRole());

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // findAllWithRelations()
  // ─────────────────────────────────────────────
  describe('findAllWithRelations', () => {
    it('should return all user role mappings with relations', async () => {
      const mappings = [makeUserRole(), makeUserRole({ id: 2 })];
      mockRepository.find.mockResolvedValue(mappings);

      const result = await service.findAllWithRelations();

      expect(result).toEqual(mappings);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_deleted: false },
          relations: ['appUser', 'role'],
        }),
      );
    });

    it('should return empty array when no mappings exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllWithRelations();

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findRolesByUserId()
  // ─────────────────────────────────────────────
  describe('findRolesByUserId', () => {
    it('should return all roles for a user', async () => {
      const mappings = [
        makeUserRole({ role: { id: 1 } }),
        makeUserRole({ id: 2, role: { id: 2 } }),
      ];
      mockRepository.find.mockResolvedValue(mappings);

      const result = await service.findRolesByUserId(1);

      expect(result).toEqual(mappings);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { appUser: { id: 1 }, is_deleted: false },
          relations: ['appUser', 'role'],
        }),
      );
    });

    it('should return empty array when user has no roles', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findRolesByUserId(99);

      // should NOT throw — just return empty array
      expect(result).toEqual([]);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────
  // removeUserRole()
  // ─────────────────────────────────────────────
  describe('removeUserRole', () => {
    it('should soft delete a user role mapping', async () => {
      const mapping = makeUserRole();
      mockRepository.findOne.mockResolvedValue(mapping);
      mockRepository.save.mockResolvedValue({ ...mapping, is_deleted: true });

      const result = await service.removeUserRole(1);

      expect(result).toEqual({ message: 'Role mapping 1 removed successfully' });
      expect(mockRepository.save).toHaveBeenCalledTimes(1);

      // verify is_deleted was set to true
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_deleted: true }),
      );
    });

    it('should throw NotFoundException when mapping not found', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.removeUserRole(999)).rejects.toThrow(NotFoundException);
      await expect(service.removeUserRole(999)).rejects.toThrow(
        'User role mapping with id 999 not found',
      );
    });

    it('should NOT call save when mapping not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.removeUserRole(999)).rejects.toThrow(NotFoundException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});