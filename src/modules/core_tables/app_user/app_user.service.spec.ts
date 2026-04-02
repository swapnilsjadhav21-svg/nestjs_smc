import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppUserService } from './app_user.service';
import { AppUser } from './entities/appUser.entity';

// --- Mock Repository ---
const mockRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

// --- Helper: build a base user object ---
const makeUser = (overrides = {}): AppUser => ({
  id: 1,
  employee_code: 'EMP001',
  mobile_no: '9876543210',
  name: 'Rahul Patil',
  name_marathi: 'राहुल पाटील',  // ← string instead of null
  designation: { id: 1 } as any,
  department: { id: 1 } as any,
  reporting_to: null as any,     // ← cast to any
  status: 'ACTIVE',
  is_system_user: false,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: null as any,       // ← cast to any
  updated_by: null as any,       // ← cast to any
  ...overrides,
} as unknown as AppUser);        // ← cast through unknown

describe('AppUserService', () => {
  let service: AppUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppUserService,
        {
          provide: getRepositoryToken(AppUser),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AppUserService>(AppUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
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

    it('should create user when mobile number does not exist', async () => {
      const savedUser = makeUser();

      mockRepository.findOne.mockResolvedValue(null); // no duplicate
      mockRepository.create.mockReturnValue(savedUser);
      mockRepository.save.mockResolvedValue(savedUser);

      const result = await service.create(dto as any);

      expect(result).toEqual(savedUser);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when mobile number already exists', async () => {
      mockRepository.findOne.mockResolvedValue(makeUser()); // duplicate found

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto as any)).rejects.toThrow(
        'User with mobile number 9876543210 already exists',
      );
    });

    it('should NOT call save when duplicate mobile found', async () => {
      mockRepository.findOne.mockResolvedValue(makeUser());

      await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // findOne()
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('should return user when found', async () => {
      const user = makeUser();
      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'User with id 999 not found',
      );
    });
  });

  // ─────────────────────────────────────────────
  // findAllWithRelations()
  // ─────────────────────────────────────────────
  describe('findAllWithRelations', () => {
    it('should return all users with relations', async () => {
      const users = [makeUser(), makeUser({ id: 2, mobile_no: '9876543211' })];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAllWithRelations();

      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { is_deleted: false },
          relations: ['designation', 'department', 'reporting_to'],
        }),
      );
    });

    it('should return empty array when no users exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllWithRelations();

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findWithFilters()
  // ─────────────────────────────────────────────
  describe('findWithFilters', () => {
    it('should return paginated results with defaults', async () => {
      const users = [makeUser()];
      mockRepository.findAndCount.mockResolvedValue([users, 1]);

      const result = await service.findWithFilters({});

      expect(result.page).toBe(1);
      expect(result.page_size).toBe(50);
      expect(result.total).toBe(1);
      expect(result.data).toEqual(users);
    });

    it('should apply pagination correctly', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ page: 3, page_size: 10 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,  // (3-1) * 10
          take: 10,
        }),
      );
    });

    it('should apply department filter', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ department_id: 2 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: { id: 2 },
          }),
        }),
      );
    });

    it('should apply designation filter', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ designation_id: 3 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            designation: { id: 3 },
          }),
        }),
      );
    });

    it('should apply both filters together', async () => {
      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ department_id: 1, designation_id: 2 });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            department: { id: 1 },
            designation: { id: 2 },
          }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // update()
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('should update user info successfully', async () => {
      const user = makeUser();
      const dto = { name: 'Updated Name' };

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, ...dto });

      const result = await service.update(1, dto as any);

      expect(result.name).toBe('Updated Name');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when user to update not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when new mobile number already in use', async () => {
    const user = makeUser();
    const anotherUser = makeUser({ id: 2, mobile_no: '1111111111' });
    const dto = { mobile_no: '1111111111' };

    mockRepository.findOne
      .mockResolvedValueOnce(user)         // user found
      .mockResolvedValueOnce(anotherUser)  // duplicate mobile found
      .mockResolvedValueOnce(user)         // call 2: user found again
      .mockResolvedValueOnce(anotherUser); // call 2: duplicate mobile found again

    await expect(service.update(1, dto as any)).rejects.toThrow(BadRequestException);
    await expect(service.update(1, dto as any)).rejects.toThrow(
      'Mobile number 1111111111 is already in use',
    );
  });

    it('should allow update when mobile number is the same as current', async () => {
      const user = makeUser({ mobile_no: '9876543210' });
      const dto = { mobile_no: '9876543210' }; // same number — should not check duplicate

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue(user);

      const result = await service.update(1, dto as any);

      // findOne should only be called once (for findOne(id)), NOT for duplicate check
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(user);
    });
  });

  // ─────────────────────────────────────────────
  // updateStatus()
  // ─────────────────────────────────────────────
  describe('updateStatus', () => {
    it('should update user status to INACTIVE', async () => {
      const user = makeUser({ status: 'ACTIVE' });

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, status: 'INACTIVE' });

      const result = await service.updateStatus(1, { status: 'INACTIVE' } as any);

      expect(result.status).toBe('INACTIVE');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update user status to ACTIVE', async () => {
      const user = makeUser({ status: 'INACTIVE' });

      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockResolvedValue({ ...user, status: 'ACTIVE' });

      const result = await service.updateStatus(1, { status: 'ACTIVE' } as any);

      expect(result.status).toBe('ACTIVE');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: 'INACTIVE' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });
});