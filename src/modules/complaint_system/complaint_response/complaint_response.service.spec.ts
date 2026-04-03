import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComplaintResponseService } from './complaint_response.service';
import { ComplaintResponse } from './entities/complaint_response.entity';

const mockRepository = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('ComplaintResponseService', () => {
  let service: ComplaintResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintResponseService,
        { provide: getRepositoryToken(ComplaintResponse), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ComplaintResponseService>(ComplaintResponseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should create complaint response', async () => {
    const dto = { complaint: { id: 1 }, user: { id: 2 }, response_text: 'Noted' };
    const created = { id: 10, ...dto };

    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  // Test 3
  it('should return responses by complaint id with relations and order', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockRepository.find.mockResolvedValue(rows);

    const result = await service.findByComplaintId(7);

    expect(result).toEqual(rows);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { complaint: { id: 7 }, is_deleted: false },
      relations: ['complaint', 'user', 'citizen'],
      order: { created_at: 'ASC' },
    });
  });

  // Test 4
  it('should return all complaint responses with relations and non-deleted filter', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockRepository.find.mockResolvedValue(rows);

    const result = await service.findAllWithRelations();

    expect(result).toEqual(rows);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { is_deleted: false },
      relations: ['complaint', 'user', 'citizen'],
    });
  });
});
