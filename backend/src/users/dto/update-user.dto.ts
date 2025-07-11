import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsObject } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsObject()
  privacyPreferences?: {
    privacyLevel: number;
    anonymousMode: boolean;
    vpnRequired: boolean;
    encryptedCommunications: boolean;
  };
}