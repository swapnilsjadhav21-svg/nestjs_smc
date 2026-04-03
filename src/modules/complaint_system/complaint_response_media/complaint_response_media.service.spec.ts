import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComplaintResponseMediaService } from './complaint_response_media.service';
import { ComplaintResponseMedia } from './entities/complaint_response_media.entity';

const mockRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('ComplaintResponseMediaService', () => {
  let service: ComplaintResponseMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintResponseMediaService,
        { provide: getRepositoryToken(ComplaintResponseMedia), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ComplaintResponseMediaService>(ComplaintResponseMediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should create complaint response media', async () => {
    const dto = { complaint_response: { id: 3 }, media: { id: 9 } };
    const created = { id: 10, ...dto };

    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  // Test 3
  it('should return media by response id with relations and non-deleted filter', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockRepository.find.mockResolvedValue(rows);

    const result = await service.findByResponseId(7);

    expect(result).toEqual(rows);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { complaint_response: { id: 7 }, is_deleted: false },
      relations: ['complaint_response', 'media'],
    });
  });

  // Test 4
  it('should return all complaint response media with relations and non-deleted filter', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockRepository.find.mockResolvedValue(rows);

    const result = await service.findAllWithRelations();

    expect(result).toEqual(rows);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { is_deleted: false },
      relations: ['complaint_response', 'media'],
    });
  });
});
