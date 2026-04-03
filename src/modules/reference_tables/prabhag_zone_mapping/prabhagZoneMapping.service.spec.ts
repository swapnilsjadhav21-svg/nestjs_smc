import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { PrabhagZoneMappingService } from './prabhagZoneMapping.service';
import { PrabhagZoneMapping } from './entities/prabhagZoneMapping.entity';

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

describe('PrabhagZoneMappingService', () => {
  let service: PrabhagZoneMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrabhagZoneMappingService,
        { provide: getRepositoryToken(PrabhagZoneMapping), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<PrabhagZoneMappingService>(PrabhagZoneMappingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should create mapping when combo does not exist', async () => {
    const dto = { prabhag: { id: 1 }, zone: { id: 2 }, is_primary: false };
    const created = { id: 1, ...dto };
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  // Test 3
  it('should throw BadRequestException when prabhag+zone combo exists', async () => {
    const dto = { prabhag: { id: 1 }, zone: { id: 2 }, is_primary: false };
    mockRepository.findOne.mockResolvedValue({ id: 9, ...dto });

    await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto as any)).rejects.toThrow('already exists');
  });

  // Test 4
  it('should clear other primary mappings when is_primary is true', async () => {
    const dto = { prabhag: { id: 1 }, zone: { id: 2 }, is_primary: true };
    const created = { id: 1, ...dto };

    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.update.mockResolvedValue({});
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    await service.create(dto as any);

    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).toHaveBeenCalledWith(
      { prabhag: { id: 1 }, is_deleted: false },
      { is_primary: false },
    );
  });

  // Test 5
  it('should NOT call update when is_primary is false', async () => {
    const dto = { prabhag: { id: 1 }, zone: { id: 2 }, is_primary: false };
    const created = { id: 1, ...dto };

    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    await service.create(dto as any);

    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  // Test 6
  it('should return all mappings with relations', async () => {
    const list = [
      { id: 1, prabhag: { id: 1 }, zone: { id: 2 }, is_primary: true },
      { id: 2, prabhag: { id: 1 }, zone: { id: 3 }, is_primary: false },
    ];
    mockRepository.find.mockResolvedValue(list);

    const result = await service.findAllWithRelations();

    expect(result).toEqual(list);
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });
});
