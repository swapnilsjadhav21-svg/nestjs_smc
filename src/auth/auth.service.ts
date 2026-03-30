// auth.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppCitizen } from '../modules/core_tables/app-citizen/entities/appCitizen.entity';
import { AppUser } from '../modules/core_tables/app_user/entities/appUser.entity';
import { AppOtp } from './app-otp/entities/app-otp.entity';
import { SendOtpDto, UserType } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { AppUserRole } from 'src/modules/core_tables/app_user_role/entities/appUserRole.entity';

const OTP_EXPIRY_MINUTES = 10;
const MAX_RETRY_COUNT = 3;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppCitizen)
    private readonly citizenRepo: Repository<AppCitizen>,

    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,

    @InjectRepository(AppUserRole)
    private readonly appUserRoleRepo: Repository<AppUserRole>,

    @InjectRepository(AppOtp)
    private readonly otpRepo: Repository<AppOtp>,

    private readonly jwtService: JwtService,
  ) {}

  // ─── SEND OTP ──────────────────────────────────────────────────────
  async sendOtp(dto: SendOtpDto): Promise<{ message: string; otp: number }> {

    if (dto.user_type === UserType.OFFICER) {
      // Officer must exist — no auto registration
      const officer = await this.appUserRepo.findOne({
        where: { mobile_no: dto.mobile_number, is_deleted: false },
      });

      if (!officer) {
        throw new NotFoundException(
          `No officer found with mobile number ${dto.mobile_number}. Contact admin.`,
        );
      }

    } else {
      // Citizen — auto register if not found
      const existingCitizen = await this.citizenRepo.findOne({
        where: { mobile_no: dto.mobile_number, is_deleted: false },
      });

      if (!existingCitizen) {
        const newCitizen = this.citizenRepo.create({
          mobile_no: dto.mobile_number,
        });
        await this.citizenRepo.save(newCitizen);
      }
    }

    // Generate random 6 digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);

    // Calculate expiry — 10 minutes from now
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Check if OTP record already exists for this mobile
    const existingOtp = await this.otpRepo.findOne({
      where: { mobile_number: dto.mobile_number },
    });

    if (existingOtp) {
      // UPDATE existing record — invalidates any previous OTP
      // Handles multiple device case — only latest OTP is valid
      existingOtp.otp = generatedOtp;
      existingOtp.expire_at = expireAt;
      existingOtp.retry_count = 0;
      existingOtp.expired = false;
      await this.otpRepo.save(existingOtp);
    } else {
      // INSERT new OTP record
      const newOtp = this.otpRepo.create({
        mobile_number: dto.mobile_number,
        otp: generatedOtp,
        expire_at: expireAt,
        retry_count: 0,
        expired: false,
      });
      await this.otpRepo.save(newOtp);
    }

    // Return OTP in response since no SMS service yet
    // When SMS is ready → remove otp from response, send via SMS instead
    return {
      message: 'OTP sent successfully',
      otp: generatedOtp,
    };
  }

  // ─── VERIFY OTP ────────────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto): Promise<{ access_token: string; type: string }> {

    // STEP 1 — Find OTP record
    const otpRecord = await this.otpRepo.findOne({
      where: { mobile_number: dto.mobile_number },
    });

    if (!otpRecord) {
      throw new BadRequestException(
        `No OTP request found for this mobile number. Please request OTP first.`,
      );
    }

    // STEP 2 — Check if already expired
    if (otpRecord.expired) {
      throw new BadRequestException(
        `OTP has expired. Please request a new OTP.`,
      );
    }

    // STEP 3 — Check if OTP has timed out
    if (new Date() > otpRecord.expire_at) {
      otpRecord.expired = true;
      await this.otpRepo.save(otpRecord);
      throw new BadRequestException(
        `OTP has timed out. Please request a new OTP.`,
      );
    }

    // STEP 4 — Check retry count
    if (otpRecord.retry_count >= MAX_RETRY_COUNT) {
      otpRecord.expired = true;
      await this.otpRepo.save(otpRecord);
      throw new BadRequestException(
        `Maximum OTP attempts exceeded. Please request a new OTP.`,
      );
    }

    // STEP 5 — Verify OTP value
    if (otpRecord.otp !== parseInt(dto.otp)) {
      otpRecord.retry_count += 1;
      await this.otpRepo.save(otpRecord);

      const remainingAttempts = MAX_RETRY_COUNT - otpRecord.retry_count;
      throw new UnauthorizedException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    // STEP 6 — OTP is correct, now verify mobile belongs to correct user_type
    // Do this BEFORE marking OTP expired so user doesn't waste their OTP
    // if they accidentally sent wrong user_type
    if (dto.user_type === UserType.CITIZEN) {
      const citizen = await this.citizenRepo.findOne({
        where: { mobile_no: dto.mobile_number, is_deleted: false },
      });

      if (!citizen) {
        throw new UnauthorizedException(
          `This mobile number is not registered as a citizen account.`,
        );
      }

    } else {
      const officer = await this.appUserRepo.findOne({
        where: { mobile_no: dto.mobile_number, is_deleted: false },
      });

      if (!officer) {
        throw new UnauthorizedException(
          `This mobile number is not registered as an officer. Contact admin.`,
        );
      }
    }

    // STEP 7 — Everything verified, now mark OTP as expired so it can't be reused
    otpRecord.expired = true;
    await this.otpRepo.save(otpRecord);

    // STEP 8 — Generate correct JWT based on verified user_type
    if (dto.user_type === UserType.CITIZEN) {
      return this.generateCitizenToken(dto.mobile_number);
    } else {
      return this.generateOfficerToken(dto.mobile_number);
    }
  }

  // ─── GENERATE CITIZEN TOKEN ────────────────────────────────────────
  private async generateCitizenToken(
    mobileNumber: string,
  ): Promise<{ access_token: string; type: string }> {
    const citizen = await this.citizenRepo.findOne({
      where: { mobile_no: mobileNumber, is_deleted: false },
    });

    if (!citizen) {
      throw new NotFoundException(`Citizen account not found`);
    }

    const payload = {
      sub: citizen.id,
      mobile: mobileNumber,
      type: 'CITIZEN' as const,
    };

    return {
      access_token: this.jwtService.sign(payload),
      type: 'CITIZEN',
    };
  }

  // ─── GENERATE OFFICER TOKEN ────────────────────────────────────────
 private async generateOfficerToken(
  mobileNumber: string,
): Promise<{ access_token: string; type: string }> {
  const officer = await this.appUserRepo.findOne({
    where: { mobile_no: mobileNumber, is_deleted: false },
  });

  if (!officer) {
    throw new NotFoundException(`Officer account not found`);
  }

  // Fetch roles separately from junction table
  const userRoles = await this.appUserRoleRepo.find({
    where: { appUser: { id: officer.id }, is_deleted: false },
    relations: ['role'],
  });

  const roles = userRoles.map((ur) => ur.role?.code ?? '').filter(Boolean);

  const payload = {
    sub: officer.id,
    mobile: mobileNumber,
    type: 'OFFICER' as const,
    roles,
  };

  return {
    access_token: this.jwtService.sign(payload),
    type: 'OFFICER',
  };
}
}
