import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintMediaController } from './complaint_media.controller';
import { ComplaintMediaService } from './complaint_media.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const mockService = {
  findByComplaintId: jest.fn(),
  findAllWithRelations: jest.fn(),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ComplaintMediaController', () => {
  let controller: ComplaintMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintMediaController],
      providers: [{ provide: ComplaintMediaService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ComplaintMediaController>(ComplaintMediaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should return complaint media by complaint id', async () => {
    const rows = [{ id: 11 }, { id: 12 }];
    mockService.findByComplaintId.mockResolvedValue(rows);

    const result = await controller.findByComplaintId(22);

    expect(result).toEqual(rows);
    expect(mockService.findByComplaintId).toHaveBeenCalledWith(22);
  });

  // Test 3
  it('should return all complaint media with relations', async () => {
    const rows = [{ id: 11 }, { id: 12 }];
    mockService.findAllWithRelations.mockResolvedValue(rows);

    const result = await controller.findAll();

    expect(result).toEqual(rows);
    expect(mockService.findAllWithRelations).toHaveBeenCalledTimes(1);
  });
});
