// auth.service.ts
import { Injectable, NotFoundException, 
         UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppCitizen } from '../modules/core_tables/app-citizen/entities/appCitizen.entity';
import { AppUser } from '../modules/core_tables/app_user/entities/appUser.entity';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AppCitizen)
    private readonly citizenRepo: Repository<AppCitizen>,

    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,

    private readonly jwtService: JwtService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    // Check if mobile exists in either table
    const citizen = await this.citizenRepo.findOne({
      where: { mobile_no: dto.mobile_number, is_deleted: false },
    });

    const officer = await this.appUserRepo.findOne({
      where: { mobile_no: dto.mobile_number, is_deleted: false },
    });

    if (!citizen && !officer) {
      throw new NotFoundException(
        `No account found with mobile number ${dto.mobile_number}`,
      );
    }

    // In production: generate OTP, save to DB, send SMS here
    // For now: just return success, any 4 digit OTP will work
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<{ access_token: string; type: string }> {

    // OTP validation skipped for now — any 4 digit value accepted
    // In production: fetch OTP from DB, compare, check expiry here

    // Check citizen first
    const citizen = await this.citizenRepo.findOne({
      where: { mobile_no: dto.mobile_number, is_deleted: false },
    });

    if (citizen) {
      const payload = {
        sub: citizen.id,
        mobile: dto.mobile_number,
        type: 'CITIZEN' as const,
      };

      return {
        access_token: this.jwtService.sign(payload),
        type: 'CITIZEN',
      };
    }

    // Check officer if not a citizen
    const officer = await this.appUserRepo.findOne({
      where: { mobile_no: dto.mobile_number, is_deleted: false },
    });

    if (officer) {
      const payload = {
        sub: officer.id,
        mobile: dto.mobile_number,
        type: 'OFFICER' as const,
        roles: [],
      };

      return {
        access_token: this.jwtService.sign(payload),
        type: 'OFFICER',
      };
    }

    throw new NotFoundException(
      `No account found with mobile number ${dto.mobile_number}`,
    );
  }
}