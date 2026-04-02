import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AssignmentEngineService } from './assignment-engine.service';
import { ComplaintAssignmentConfig } from '../complaint_assignment_config/entities/complaint_assignment_config.entity';
import { PrabhagZoneMapping } from '../../reference_tables/prabhag_zone_mapping/entities/prabhagZoneMapping.entity';
import { AppUser } from '../../core_tables/app_user/entities/appUser.entity';

const mockConfigRepo = {
  findOne: jest.fn(),
};

const mockPrabhagZoneMappingRepo = {
  findOne: jest.fn(),
};

const mockAppUserRepo = {
  createQueryBuilder: jest.fn(),
};

const createQueryBuilderMock = (returnValue: any) => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getOne: jest.fn().mockResolvedValue(returnValue),
});

describe('AssignmentEngineService', () => {
  let service: AssignmentEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentEngineService,
        {
          provide: getRepositoryToken(ComplaintAssignmentConfig),
          useValue: mockConfigRepo,
        },
        {
          provide: getRepositoryToken(PrabhagZoneMapping),
          useValue: mockPrabhagZoneMappingRepo,
        },
        {
          provide: getRepositoryToken(AppUser),
          useValue: mockAppUserRepo,
        },
      ],
    }).compile();

    service = module.get<AssignmentEngineService>(AssignmentEngineService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('assign() - config not found', () => {
    it('Test 1: throws NotFoundException when no config exists for complaint type', async () => {
      mockConfigRepo.findOne.mockResolvedValue(null);

      await expect(service.assign(999, 1)).rejects.toThrow(NotFoundException);
      await expect(service.assign(999, 1)).rejects.toThrow(
        'No assignment config found for complaint type 999',
      );
    });
  });

  describe('ZONE Strategy', () => {
    it('Test 2: returns officer when prabhag has primary zone and officer found', async () => {
      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'ZONE' },
        designation: { id: 1 },
      });
      mockPrabhagZoneMappingRepo.findOne.mockResolvedValue({
        zone: { id: 2 },
        is_primary: true,
      });
      mockAppUserRepo.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock({ id: 5, name: 'Test Officer', department: { id: 1 } }),
      );

      const result = await service.assign(1, 3);

      expect(result.officer).not.toBeNull();
      expect(result.zone_id).toBe(2);
      expect(result.department_id).toBe(1);
    });

    it('Test 3: falls back to non-primary zone when no primary zone exists', async () => {
      const fallbackMapping = { zone: { id: 3 }, is_primary: false };

      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'ZONE' },
        designation: { id: 1 },
      });
      mockPrabhagZoneMappingRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(fallbackMapping);
      mockAppUserRepo.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock({ id: 5, name: 'Test Officer', department: { id: 1 } }),
      );

      const result = await service.assign(1, 3);

      expect(result.officer).not.toBeNull();
      expect(result.zone_id).toBe(3);
    });

    it('Test 4: returns null officer when prabhag is null', async () => {
      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'ZONE' },
        designation: { id: 1 },
      });

      const result = await service.assign(1, null);

      expect(result.officer).toBeNull();
      expect(result.zone_id).toBeNull();
      expect(result.department_id).toBeNull();
      expect(mockPrabhagZoneMappingRepo.findOne).not.toHaveBeenCalled();
    });

    it('Test 5: returns null officer when no zone mapping found for prabhag', async () => {
      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'ZONE' },
        designation: { id: 1 },
      });
      mockPrabhagZoneMappingRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await service.assign(1, 3);

      expect(result.officer).toBeNull();
      expect(result.zone_id).toBeNull();
    });

    it('Test 6: returns null officer with zone_id when zone found but no officer', async () => {
      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'ZONE' },
        designation: { id: 1 },
      });
      mockPrabhagZoneMappingRepo.findOne.mockResolvedValue({
        zone: { id: 2 },
        is_primary: true,
      });
      mockAppUserRepo.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock(null),
      );

      const result = await service.assign(1, 3);

      expect(result.officer).toBeNull();
      expect(result.zone_id).toBe(2);
    });
  });

  describe('DEPARTMENT Strategy', () => {
    it('Test 7: returns officer when matching department + designation officer found', async () => {
      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'DEPARTMENT' },
        designation: { id: 2 },
        department: { id: 1 },
      });
      mockAppUserRepo.createQueryBuilder.mockReturnValue(
        createQueryBuilderMock({ id: 7, name: 'Officer', department: { id: 1 } }),
      );

      const result = await service.assign(1, null);

      expect(result.officer).not.toBeNull();
      expect(result.officer?.id).toBe(7);
      expect(result.department_id).toBe(1);
      expect(result.zone_id).toBeNull();
    });

    it('Test 8: falls back to highest designation officer when no matching officer found', async () => {
      const fallbackOfficer = {
        id: 3,
        name: 'Senior Officer',
        designation: { hierarchy_level: 1 },
        department: { id: 1 },
      };

      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'DEPARTMENT' },
        designation: { id: 2 },
        department: { id: 1 },
      });
      mockAppUserRepo.createQueryBuilder
        .mockReturnValueOnce(createQueryBuilderMock(null))
        .mockReturnValueOnce(createQueryBuilderMock(fallbackOfficer));

      const result = await service.assign(1, null);

      expect(result.officer).not.toBeNull();
      expect(result.officer?.id).toBe(3);
      expect(result.department_id).toBe(1);
    });

    it('Test 9: returns null officer when no officer found at all in department', async () => {
      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'DEPARTMENT' },
        designation: { id: 2 },
        department: { id: 1 },
      });
      mockAppUserRepo.createQueryBuilder
        .mockReturnValueOnce(createQueryBuilderMock(null))
        .mockReturnValueOnce(createQueryBuilderMock(null));

      const result = await service.assign(1, null);

      expect(result.officer).toBeNull();
      expect(result.department_id).toBe(1);
    });
  });

  describe('AssignmentResult shape', () => {
    it('Test 10: always returns object with officer, zone_id, department_id fields', async () => {
      mockConfigRepo.findOne.mockResolvedValue({
        strategy: { code: 'ZONE' },
        designation: { id: 1 },
      });
      mockPrabhagZoneMappingRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await service.assign(1, 1);

      expect(result).toHaveProperty('officer');
      expect(result).toHaveProperty('zone_id');
      expect(result).toHaveProperty('department_id');

      expect(result.officer).not.toBeUndefined();
      expect(result.zone_id).not.toBeUndefined();
      expect(result.department_id).not.toBeUndefined();
    });
  });
});
