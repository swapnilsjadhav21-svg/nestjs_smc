import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AppCitizenController } from './app-citizen.controller';
import { AppCitizenService } from './app-citizen.service';
import { AppCitizen } from './entities/appCitizen.entity';

const mockAppCitizenService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const makeCitizen = (overrides = {}): AppCitizen => ({
  id: 1,
  mobile_no: '9876543210',
  name: 'Rahul Patil',
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: null as any,
  updated_by: null as any,
  ...overrides,
} as unknown as AppCitizen);

describe('AppCitizenController', () => {
  let controller: AppCitizenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppCitizenController],
      providers: [
        {
          provide: AppCitizenService,
          useValue: mockAppCitizenService,
        },
      ],
    }).compile();

    controller = module.get<AppCitizenController>(AppCitizenController);
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
    const dto = { mobile_no: '9876543210', name: 'Rahul Patil' };

    it('should create a citizen and return result', async () => {
      const created = makeCitizen();
      mockAppCitizenService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any);

      expect(result).toEqual(created);
      expect(mockAppCitizenService.create).toHaveBeenCalledWith(dto);
      expect(mockAppCitizenService.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when mobile number already exists', async () => {
      mockAppCitizenService.create.mockRejectedValue(
        new ConflictException('Citizen with mobile number 9876543210 already exists'),
      );

      await expect(controller.create(dto as any)).rejects.toThrow(ConflictException);
      await expect(controller.create(dto as any)).rejects.toThrow(
        'Citizen with mobile number 9876543210 already exists',
      );
    });

    it('should NOT call create twice when first call throws', async () => {
      mockAppCitizenService.create.mockRejectedValue(
        new ConflictException('already exists'),
      );

      await expect(controller.create(dto as any)).rejects.toThrow(ConflictException);
      expect(mockAppCitizenService.create).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────
  // findAll() — inherited from BaseCrudController
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all citizens', async () => {
      const citizens = [makeCitizen(), makeCitizen({ id: 2, mobile_no: '9876543211' })];
      mockAppCitizenService.findAll.mockResolvedValue(citizens);

      const result = await controller.findAll();

      expect(result).toEqual(citizens);
      expect(mockAppCitizenService.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no citizens exist', async () => {
      mockAppCitizenService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findOne() — inherited from BaseCrudController
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('should return citizen by id', async () => {
      const citizen = makeCitizen();
      mockAppCitizenService.findOne.mockResolvedValue(citizen);

      const result = await controller.findOne(1);

      expect(result).toEqual(citizen);
      expect(mockAppCitizenService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when citizen not found', async () => {
      mockAppCitizenService.findOne.mockRejectedValue(
        new Error('Record with id 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(
        'Record with id 999 not found',
      );
    });
  });
});