import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppUserController } from './app_user.controller';
import { AppUserService } from './app_user.service';
import { AppUser } from './entities/appUser.entity';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockAppUserService = {
  create: jest.fn(),
  findWithFilters: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const makeUser = (overrides = {}): AppUser => ({
  id: 1,
  employee_code: 'EMP001',
  mobile_no: '9876543210',
  name: 'Rahul Patil',
  name_marathi: 'राहुल पाटील',
  designation: { id: 1 } as any,
  department: { id: 1 } as any,
  reporting_to: null as any,
  status: 'ACTIVE',
  is_system_user: false,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: null as any,
  updated_by: null as any,
  ...overrides,
} as unknown as AppUser);

describe('AppUserController', () => {
  let controller: AppUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUserController],
      providers: [
        {
          provide: AppUserService,
          useValue: mockAppUserService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<AppUserController>(AppUserController);
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
    const dto = {
      employee_code: 'EMP001',
      mobile_no: '9876543210',
      name: 'Rahul Patil',
      designation: { id: 1 },
      department: { id: 1 },
      status: 'ACTIVE',
      is_system_user: false,
    };

    it('should create a user and return result', async () => {
      const created = makeUser();
      mockAppUserService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(result).toEqual(created);
      expect(mockAppUserService.create).toHaveBeenCalledWith(dto);
      expect(mockAppUserService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when mobile number already exists', async () => {
      mockAppUserService.create.mockRejectedValue(
        new BadRequestException('User with mobile number 9876543210 already exists'),
      );

      await expect(controller.create(dto as any)).rejects.toThrow(BadRequestException);
      await expect(controller.create(dto as any)).rejects.toThrow(
        'User with mobile number 9876543210 already exists',
      );
    });
  });

  // ─────────────────────────────────────────────
  // findWithFilters()
  // ─────────────────────────────────────────────
  describe('findWithFilters', () => {
    it('should return paginated users with no filters', async () => {
      const paginatedResult = { data: [makeUser()], total: 1, page: 1, page_size: 50 };
      mockAppUserService.findWithFilters.mockResolvedValue(paginatedResult);

      const result = await controller.findWithFilters();

      expect(result).toEqual(paginatedResult);
      expect(mockAppUserService.findWithFilters).toHaveBeenCalledWith({
        department_id: undefined,
        designation_id: undefined,
        page: 1,
        page_size: 50,
      });
    });

    it('should pass department_id filter correctly', async () => {
      mockAppUserService.findWithFilters.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        page_size: 50,
      });

      await controller.findWithFilters(2 as any);

      expect(mockAppUserService.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ department_id: 2 }),
      );
    });

    it('should pass designation_id filter correctly', async () => {
      mockAppUserService.findWithFilters.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        page_size: 50,
      });

      await controller.findWithFilters(undefined, 3 as any);

      expect(mockAppUserService.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ designation_id: 3 }),
      );
    });

    it('should pass pagination params correctly', async () => {
      mockAppUserService.findWithFilters.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        page_size: 10,
      });

      await controller.findWithFilters(undefined, undefined, 2 as any, 10 as any);

      expect(mockAppUserService.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, page_size: 10 }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // findOne()
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = makeUser();
      mockAppUserService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(1);

      expect(result).toEqual(user);
      expect(mockAppUserService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockAppUserService.findOne.mockRejectedValue(
        new NotFoundException('User with id 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        'User with id 999 not found',
      );
    });
  });

  // ─────────────────────────────────────────────
  // update()
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('should update user and return result', async () => {
      const updated = makeUser({ name: 'Updated Name' });
      mockAppUserService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { name: 'Updated Name' } as any);

      expect(result).toEqual(updated);
      expect(mockAppUserService.update).toHaveBeenCalledWith(1, { name: 'Updated Name' });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockAppUserService.update.mockRejectedValue(
        new NotFoundException('User with id 999 not found'),
      );

      await expect(
        controller.update(999, { name: 'Test' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when mobile already in use', async () => {
      mockAppUserService.update.mockRejectedValue(
        new BadRequestException('Mobile number 1111111111 is already in use'),
      );

      await expect(
        controller.update(1, { mobile_no: '1111111111' } as any),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.update(1, { mobile_no: '1111111111' } as any),
      ).rejects.toThrow('Mobile number 1111111111 is already in use');
    });
  });

  // ─────────────────────────────────────────────
  // updateStatus()
  // ─────────────────────────────────────────────
  describe('updateStatus', () => {
    it('should update status to INACTIVE', async () => {
      const updated = makeUser({ status: 'INACTIVE' });
      mockAppUserService.updateStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus(1, { status: 'INACTIVE' } as any);

      expect(result.status).toBe('INACTIVE');
      expect(mockAppUserService.updateStatus).toHaveBeenCalledWith(1, { status: 'INACTIVE' });
    });

    it('should update status to ACTIVE', async () => {
      const updated = makeUser({ status: 'ACTIVE' });
      mockAppUserService.updateStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus(1, { status: 'ACTIVE' } as any);

      expect(result.status).toBe('ACTIVE');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockAppUserService.updateStatus.mockRejectedValue(
        new NotFoundException('User with id 999 not found'),
      );

      await expect(
        controller.updateStatus(999, { status: 'INACTIVE' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});