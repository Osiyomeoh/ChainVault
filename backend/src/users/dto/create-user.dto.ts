import {
    IsEmail,
    IsString,
    IsOptional,
    IsObject,
    IsEnum,
    MinLength,
  } from 'class-validator';
  import { KYCStatus } from '../entities/user.entity';
  
  export class CreateUserDto {
    @IsEmail()
    email: string;
  
    @IsString()
    @MinLength(6)
    password?: string; // Optional because we might pass passwordHash directly
  
    @IsString()
    @IsOptional()
    passwordHash?: string;
  
    @IsOptional()
    @IsObject()
    privacyPreferences?: {
      privacyLevel: number;
      anonymousMode: boolean;
      vpnRequired: boolean;
      encryptedCommunications: boolean;
    };
  
    @IsOptional()
    @IsEnum(KYCStatus)
    kycStatus?: KYCStatus;
  
    @IsOptional()
    @IsObject()
    kycData?: any;
  }