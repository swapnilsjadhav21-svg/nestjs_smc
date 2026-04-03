import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComplaintMediaService } from './complaint_media.service';
import { ComplaintMedia } from './entities/complaint_media.entity';

const mockRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('ComplaintMediaService', () => {
  let service: ComplaintMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintMediaService,
        { provide: getRepositoryToken(ComplaintMedia), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ComplaintMediaService>(ComplaintMediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should create complaint media', async () => {
    const dto = { complaint: { id: 1 }, media: { id: 5 } };
    const created = { id: 10, ...dto };

    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  // Test 3
  it('should return media by complaint id with relations and non-deleted filter', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockRepository.find.mockResolvedValue(rows);

    const result = await service.findByComplaintId(7);

    expect(result).toEqual(rows);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { complaint: { id: 7 }, is_deleted: false },
      relations: ['complaint', 'media'],
    });
  });

  // Test 4
  it('should return all complaint media with relations and non-deleted filter', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockRepository.find.mockResolvedValue(rows);

    const result = await service.findAllWithRelations();

    expect(result).toEqual(rows);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { is_deleted: false },
      relations: ['complaint', 'media'],
    });
  });
});
