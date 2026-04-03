import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { ComplaintTypeService } from './complaint_type.service';
import { ComplaintType } from './entities/complaint_type.entity';

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('ComplaintTypeService', () => {
  let service: ComplaintTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintTypeService,
        { provide: getRepositoryToken(ComplaintType), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ComplaintTypeService>(ComplaintTypeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should create complaint type when name does not exist', async () => {
    const dto = { name: 'Water Leakage' };
    const created = { id: 1, ...dto };

    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  // Test 3
  it('should throw ConflictException when complaint type name already exists', async () => {
    const dto = { name: 'Water Leakage' };
    mockRepository.findOne.mockResolvedValue({ id: 99, ...dto });

    await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    await expect(service.create(dto as any)).rejects.toThrow('Water Leakage already exists');
  });

  // Test 4
  it('should return all complaint types', async () => {
    const list = [
      { id: 1, name: 'Water Leakage' },
      { id: 2, name: 'Garbage Collection' },
    ];
    mockRepository.find.mockResolvedValue(list);

    const result = await service.findAll();

    expect(result).toEqual(list);
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });
});
