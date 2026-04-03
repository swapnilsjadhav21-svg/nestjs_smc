import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintResponseMediaController } from './complaint_response_media.controller';
import { ComplaintResponseMediaService } from './complaint_response_media.service';
import { OfficerGuard } from 'src/auth/guards/officer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockService = {
  create: jest.fn(),
  findByResponseId: jest.fn(),
  findAllWithRelations: jest.fn(),
};

const mockOfficerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ComplaintResponseMediaController', () => {
  let controller: ComplaintResponseMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintResponseMediaController],
      providers: [{ provide: ComplaintResponseMediaService, useValue: mockService }],
    })
      .overrideGuard(OfficerGuard)
      .useValue(mockOfficerGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<ComplaintResponseMediaController>(ComplaintResponseMediaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should attach media to complaint response by setting response id on dto', async () => {
    const dto: any = { media: { id: 20 } };
    const created = { id: 1, complaint_response: { id: 7 }, media: { id: 20 } };
    mockService.create.mockResolvedValue(created);

    const result = await controller.attachMedia(7, dto);

    expect(result).toEqual(created);
    expect(dto.complaint_response).toEqual({ id: 7 });
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  // Test 3
  it('should return media by response id', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockService.findByResponseId.mockResolvedValue(rows);

    const result = await controller.findByResponseId(11);

    expect(result).toEqual(rows);
    expect(mockService.findByResponseId).toHaveBeenCalledWith(11);
  });

  // Test 4
  it('should return all complaint response media', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockService.findAllWithRelations.mockResolvedValue(rows);

    const result = await controller.findAll();

    expect(result).toEqual(rows);
    expect(mockService.findAllWithRelations).toHaveBeenCalledTimes(1);
  });
});
