import { Test, TestingModule } from '@nestjs/testing';
import { AppCitizenService } from './app-citizen.service';

describe('AppCitizenService', () => {
  let service: AppCitizenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppCitizenService],
    }).compile();

    service = module.get<AppCitizenService>(AppCitizenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
