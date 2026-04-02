import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppCitizen } from '../modules/core_tables/app-citizen/entities/appCitizen.entity';
import { AppUser } from '../modules/core_tables/app_user/entities/appUser.entity';
import { AppUserRole } from '../modules/core_tables/app_user_role/entities/appUserRole.entity';
import { AppOtp } from './app-otp/entities/app-otp.entity';

const mockCitizenRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockAppUserRepo = {
  findOne: jest.fn(),
};

const mockAppUserRoleRepo = {
  find: jest.fn(),
};

const mockOtpRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(AppCitizen), useValue: mockCitizenRepo },
        { provide: getRepositoryToken(AppUser), useValue: mockAppUserRepo },
        { provide: getRepositoryToken(AppUserRole), useValue: mockAppUserRoleRepo },
        { provide: getRepositoryToken(AppOtp), useValue: mockOtpRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('sendOtp()', () => {
    it('Test 1: creates new citizen account if citizen not found', async () => {
      mockCitizenRepo.findOne.mockResolvedValue(null);
      mockCitizenRepo.create.mockReturnValue({ mobile_no: '9876543210' });
      mockCitizenRepo.save.mockResolvedValue({ id: 1, mobile_no: '9876543210' });
      mockOtpRepo.findOne.mockResolvedValue(null);
      mockOtpRepo.create.mockImplementation((dto: any) => dto);
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const result = await service.sendOtp({
        mobile_number: '9876543210',
        user_type: 'CITIZEN' as any,
      });

      expect(mockAppUserRepo.findOne).not.toHaveBeenCalled();
      expect(mockCitizenRepo.save).toHaveBeenCalledTimes(1);
      expect(result.message).toBe('OTP sent successfully');
      expect(result.otp).toBeGreaterThanOrEqual(100000);
      expect(result.otp).toBeLessThanOrEqual(999999);
    });

    it('Test 2: does not create new account if citizen already exists', async () => {
      mockCitizenRepo.findOne.mockResolvedValue({ id: 1, mobile_no: '9876543210' });
      mockOtpRepo.findOne.mockResolvedValue(null);
      mockOtpRepo.create.mockImplementation((dto: any) => dto);
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const result = await service.sendOtp({
        mobile_number: '9876543210',
        user_type: 'CITIZEN' as any,
      });

      expect(mockCitizenRepo.save).not.toHaveBeenCalled();
      expect(result.message).toBe('OTP sent successfully');
    });

    it('Test 3: updates existing OTP record instead of creating new one', async () => {
      const existingOtp = {
        id: 1,
        mobile_number: '9876543210',
        otp: 111111,
        retry_count: 2,
        expired: true,
        expire_at: new Date(),
      };

      mockCitizenRepo.findOne.mockResolvedValue({ id: 1, mobile_no: '9876543210' });
      mockOtpRepo.findOne.mockResolvedValue(existingOtp);
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      await service.sendOtp({
        mobile_number: '9876543210',
        user_type: 'CITIZEN' as any,
      });

      expect(mockOtpRepo.create).not.toHaveBeenCalled();
      expect(mockOtpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ retry_count: 0, expired: false }),
      );
      const savedOtp = mockOtpRepo.save.mock.calls[0][0];
      expect(savedOtp.otp).not.toBe(111111);
      expect(savedOtp.otp).toBeGreaterThanOrEqual(100000);
      expect(savedOtp.otp).toBeLessThanOrEqual(999999);
    });

    it('Test 4: throws NotFoundException when officer mobile not found', async () => {
      mockAppUserRepo.findOne.mockResolvedValue(null);

      const action = service.sendOtp({
        mobile_number: '9999999999',
        user_type: 'OFFICER' as any,
      });

      await expect(action).rejects.toThrow(NotFoundException);
      await expect(action).rejects.toThrow('No officer found');
    });

    it('Test 5: succeeds for existing officer', async () => {
      mockAppUserRepo.findOne.mockResolvedValue({ id: 1, mobile_no: '9999999999' });
      mockOtpRepo.findOne.mockResolvedValue(null);
      mockOtpRepo.create.mockImplementation((dto: any) => dto);
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const result = await service.sendOtp({
        mobile_number: '9999999999',
        user_type: 'OFFICER' as any,
      });

      expect(result.message).toBe('OTP sent successfully');
      expect(result.otp).toBeGreaterThanOrEqual(100000);
      expect(result.otp).toBeLessThanOrEqual(999999);
    });
  });

  describe('verifyOtp() - OTP validation failures', () => {
    it('Test 6: throws BadRequestException when no OTP record found', async () => {
      mockOtpRepo.findOne.mockResolvedValue(null);

      const action = service.verifyOtp({
        mobile_number: '9876543210',
        otp: '123456',
        user_type: 'CITIZEN' as any,
      });

      await expect(action).rejects.toThrow(BadRequestException);
      await expect(action).rejects.toThrow('Please request OTP first');
    });

    it('Test 7: throws BadRequestException when OTP already expired', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: true,
        expire_at: new Date(Date.now() + 600000),
        retry_count: 0,
        otp: 123456,
      });

      const action = service.verifyOtp({
        mobile_number: '9876543210',
        otp: '123456',
        user_type: 'CITIZEN' as any,
      });

      await expect(action).rejects.toThrow(BadRequestException);
      await expect(action).rejects.toThrow('OTP has expired');
    });

    it('Test 8: throws BadRequestException when OTP has timed out', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: false,
        expire_at: new Date(Date.now() - 1000),
        retry_count: 0,
        otp: 123456,
      });
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const action = service.verifyOtp({
        mobile_number: '9876543210',
        otp: '123456',
        user_type: 'CITIZEN' as any,
      });

      await expect(action).rejects.toThrow(BadRequestException);
      await expect(action).rejects.toThrow('OTP has timed out');
      expect(mockOtpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ expired: true }),
      );
    });

    it('Test 9: throws BadRequestException when max retries exceeded', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: false,
        expire_at: new Date(Date.now() + 600000),
        retry_count: 3,
        otp: 123456,
      });
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const action = service.verifyOtp({
        mobile_number: '9876543210',
        otp: '123456',
        user_type: 'CITIZEN' as any,
      });

      await expect(action).rejects.toThrow(BadRequestException);
      await expect(action).rejects.toThrow('Maximum OTP attempts exceeded');
      expect(mockOtpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ expired: true }),
      );
    });

    it('Test 10: increments retry count on wrong OTP', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: false,
        expire_at: new Date(Date.now() + 600000),
        retry_count: 0,
        otp: 123456,
      });
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const action = service.verifyOtp({
        mobile_number: '9876543210',
        otp: '999999',
        user_type: 'CITIZEN' as any,
      });

      await expect(action).rejects.toThrow(UnauthorizedException);
      await expect(action).rejects.toThrow('2 attempt(s) remaining');
      expect(mockOtpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ retry_count: 1 }),
      );
    });
  });

  describe('verifyOtp() - user_type mismatch', () => {
    it('Test 11: throws UnauthorizedException when officer mobile used with CITIZEN type', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: false,
        expire_at: new Date(Date.now() + 600000),
        retry_count: 0,
        otp: 123456,
      });
      mockCitizenRepo.findOne.mockResolvedValue(null);

      const action = service.verifyOtp({
        mobile_number: '9999999999',
        otp: '123456',
        user_type: 'CITIZEN' as any,
      });

      await expect(action).rejects.toThrow(UnauthorizedException);
      await expect(action).rejects.toThrow('not registered as a citizen');
      expect(mockOtpRepo.save).not.toHaveBeenCalled();
    });

    it('Test 12: throws UnauthorizedException when citizen mobile used with OFFICER type', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: false,
        expire_at: new Date(Date.now() + 600000),
        retry_count: 0,
        otp: 123456,
      });
      mockAppUserRepo.findOne.mockResolvedValue(null);

      const action = service.verifyOtp({
        mobile_number: '9876543210',
        otp: '123456',
        user_type: 'OFFICER' as any,
      });

      await expect(action).rejects.toThrow(UnauthorizedException);
      await expect(action).rejects.toThrow('not registered as an officer');
    });
  });

  describe('verifyOtp() - successful verification', () => {
    it('Test 13: returns citizen JWT token on correct OTP', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: false,
        expire_at: new Date(Date.now() + 600000),
        retry_count: 0,
        otp: 123456,
      });
      mockCitizenRepo.findOne.mockResolvedValue({ id: 1, mobile_no: '9876543210' });
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const result = await service.verifyOtp({
        mobile_number: '9876543210',
        otp: '123456',
        user_type: 'CITIZEN' as any,
      });

      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.type).toBe('CITIZEN');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({ sub: 1, type: 'CITIZEN', mobile: '9876543210' }),
      );
      expect(mockOtpRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ expired: true }),
      );
    });

    it('Test 14: returns officer JWT token with roles on correct OTP', async () => {
      mockOtpRepo.findOne.mockResolvedValue({
        expired: false,
        expire_at: new Date(Date.now() + 600000),
        retry_count: 0,
        otp: 123456,
      });
      mockAppUserRepo.findOne.mockResolvedValue({ id: 5, mobile_no: '9999999999' });
      mockAppUserRoleRepo.find.mockResolvedValue([
        { role: { code: 'ADMIN' }, is_deleted: false },
        { role: { code: 'ENGINEER' }, is_deleted: false },
      ]);
      mockOtpRepo.save.mockImplementation((dto: any) => Promise.resolve(dto));

      const result = await service.verifyOtp({
        mobile_number: '9999999999',
        otp: '123456',
        user_type: 'OFFICER' as any,
      });

      expect(result.type).toBe('OFFICER');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 5,
          type: 'OFFICER',
          roles: ['ADMIN', 'ENGINEER'],
        }),
      );
    });
  });
});
