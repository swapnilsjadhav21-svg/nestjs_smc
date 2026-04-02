import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { AppCitizenService } from './app-citizen.service';
import { AppCitizen } from './entities/appCitizen.entity';

// --- Mock Repository ---
const mockRepository = {
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

// --- Helper: build a base citizen object ---
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

describe('AppCitizenService', () => {
  let service: AppCitizenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppCitizenService,
        {
          provide: getRepositoryToken(AppCitizen),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AppCitizenService>(AppCitizenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // service defined
  // ─────────────────────────────────────────────
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ─────────────────────────────────────────────
  // create()
  // ─────────────────────────────────────────────
  describe('create', () => {
    const dto = {
      mobile_no: '9876543210',
      name: 'Rahul Patil',
    };

    it('should create citizen when mobile number does not exist', async () => {
      const savedCitizen = makeCitizen();

      mockRepository.findOne.mockResolvedValue(null); // no duplicate
      mockRepository.create.mockReturnValue(savedCitizen);
      mockRepository.save.mockResolvedValue(savedCitizen);

      const result = await service.create(dto as any);

      expect(result).toEqual(savedCitizen);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when mobile number already exists', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce(makeCitizen()) // call 1: duplicate found
        .mockResolvedValueOnce(makeCitizen()); // call 2: duplicate found

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
      await expect(service.create(dto as any)).rejects.toThrow(
        'Citizen with mobile number 9876543210 already exists',
      );
    });

    it('should NOT call save when duplicate mobile found', async () => {
      mockRepository.findOne.mockResolvedValue(makeCitizen());

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create citizen without name since name is optional', async () => {
      const dtoWithoutName = { mobile_no: '9876543210' };
      const savedCitizen = makeCitizen({ name: null });

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(savedCitizen);
      mockRepository.save.mockResolvedValue(savedCitizen);

      const result = await service.create(dtoWithoutName as any);

      expect(result).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────
  // findAll() — inherited from BaseCrudService
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('should return all citizens', async () => {
      const citizens = [makeCitizen(), makeCitizen({ id: 2, mobile_no: '9876543211' })];
      mockRepository.find.mockResolvedValue(citizens);

      const result = await service.findAll();

      expect(result).toEqual(citizens);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no citizens exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findOne() — inherited from BaseCrudService
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('should return citizen when found', async () => {
      const citizen = makeCitizen();
      mockRepository.findOneBy.mockResolvedValue(citizen);

      const result = await service.findOne(1);

      expect(result).toEqual(citizen);
    });

    it('should throw NotFoundException when citizen not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Record with id 999 not found',
      );
    });
  });
});