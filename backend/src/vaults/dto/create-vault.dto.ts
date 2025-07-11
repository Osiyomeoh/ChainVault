import {
    IsString,
    IsNumber,
    IsOptional,
    IsEnum,
    IsObject,
    ValidateNested,
    Min,
    Max,
    Length,
    IsArray,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { PrivacyLevel } from '../entities/vault.entity';
  
  class BasicInfoDto {
    @IsString()
    @Length(1, 255)
    name: string;
  
    @IsOptional()
    @IsString()
    @Length(0, 1000)
    description?: string;
  
    @IsEnum(PrivacyLevel)
    privacyLevel: PrivacyLevel;
  
    @IsNumber()
    @Min(1)
    @Max(365)
    inheritanceDelay: number;
  
    @IsNumber()
    @Min(1)
    @Max(365)
    checkInFrequency: number;
  }
  
  class AssetConfigurationDto {
    @IsArray()
    @IsOptional()
    addresses?: {
      address: string;
      label: string;
      type: 'legacy' | 'segwit' | 'taproot';
      derivationPath?: string;
    }[];
  
    @IsArray()
    @IsOptional()
    contracts?: {
      address: string;
      blockchain: string;
      type: 'erc20' | 'erc721' | 'spl' | 'native';
    }[];
  }
  
  class BeneficiaryDto {
    @IsString()
    name: string;
  
    @IsString()
    email: string;
  
    @IsString()
    relationship: string;
  
    @IsNumber()
    @Min(0)
    @Max(100)
    allocationPercentage: number;
  
    @IsOptional()
    @IsString()
    walletAddress?: string;
  
    @IsOptional()
    @IsString()
    preferredBlockchain?: string;
  
    @IsOptional()
    @IsObject()
    conditions?: any;
  
    @IsOptional()
    @IsObject()
    privacySettings?: any;
  
    @IsOptional()
    @IsObject()
    communicationPreferences?: any;
  }
  
  class BeneficiaryConfigurationDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => BeneficiaryDto)
    beneficiaries: BeneficiaryDto[];
  }
  
  export class CreateVaultDto {
    @ValidateNested()
    @Type(() => BasicInfoDto)
    basicInfo: BasicInfoDto;
  
    @ValidateNested()
    @Type(() => AssetConfigurationDto)
    assetConfiguration: AssetConfigurationDto;
  
    @ValidateNested()
    @Type(() => BeneficiaryConfigurationDto)
    beneficiaryConfiguration: BeneficiaryConfigurationDto;
  
    @IsOptional()
    @IsObject()
    legalConfiguration?: any;
  }
  