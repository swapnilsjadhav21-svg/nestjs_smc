import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrabhagZoneMappingController } from './prabhagZoneMapping.controller';
import { PrabhagZoneMappingService } from './prabhagZoneMapping.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockService = {
  create: jest.fn(),
  findAllWithRelations: jest.fn(),
  findOne: jest.fn(),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('PrabhagZoneMappingController', () => {
  let controller: PrabhagZoneMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrabhagZoneMappingController],
      providers: [{ provide: PrabhagZoneMappingService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<PrabhagZoneMappingController>(PrabhagZoneMappingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should create mapping successfully', async () => {
    const dto = { prabhag: { id: 1 }, zone: { id: 2 }, is_primary: true };
    const created = { id: 1, ...dto };
    mockService.create.mockResolvedValue(created);

    const result = await controller.create(dto as any);

    expect(result).toEqual(created);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  // Test 3
  it('should throw BadRequestException when mapping exists', async () => {
    mockService.create.mockRejectedValue(new BadRequestException('already exists'));

    await expect(
      controller.create({ prabhag: { id: 1 }, zone: { id: 2 }, is_primary: false } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // Test 4
  it('should return all mappings with relations', async () => {
    const list = [
      { id: 1, prabhag: { id: 1 }, zone: { id: 2 }, is_primary: true },
      { id: 2, prabhag: { id: 1 }, zone: { id: 3 }, is_primary: false },
    ];
    mockService.findAllWithRelations.mockResolvedValue(list);

    const result = await controller.findAll();

    expect(result).toEqual(list);
    expect(mockService.findAllWithRelations).toHaveBeenCalledTimes(1);
  });
});
