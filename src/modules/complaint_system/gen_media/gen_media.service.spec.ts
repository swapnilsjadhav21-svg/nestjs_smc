import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GenMediaService } from './gen_media.service';
import { GenMedia } from './entities/gen_media.entity';

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('GenMediaService', () => {
  let service: GenMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenMediaService,
        { provide: getRepositoryToken(GenMedia), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<GenMediaService>(GenMediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should upload and persist media metadata', async () => {
    const file: any = { path: 'uploads/a.jpg', mimetype: 'image/jpeg' };
    const created = { id: 1, file_path: file.path, file_type: file.mimetype };

    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.upload(file);

    expect(result).toEqual(created);
    expect(mockRepository.create).toHaveBeenCalledWith({
      file_path: 'uploads/a.jpg',
      file_type: 'image/jpeg',
    });
    expect(mockRepository.save).toHaveBeenCalledWith(created);
  });

  // Test 3
  it('should return media by id when present and not deleted', async () => {
    const media = { id: 4, file_path: 'uploads/b.jpg', is_deleted: false };
    mockRepository.findOne.mockResolvedValue(media);

    const result = await service.findOne(4);

    expect(result).toEqual(media);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 4, is_deleted: false },
    });
  });

  // Test 4
  it('should throw NotFoundException when media does not exist', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(44)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(44)).rejects.toThrow('Media with id 44 not found');
  });
});
