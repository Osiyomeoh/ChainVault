import {
    IsString,
    IsEnum,
    IsOptional,
    IsNumber,
    Min,
    IsUrl,
  } from 'class-validator';
  import { AssetType } from '../entities/vault-asset.entity';
  
  export class CreateAssetDto {
    @IsString()
    blockchain: string;
  
    @IsEnum(AssetType)
    assetType: AssetType;
  
    @IsOptional()
    @IsString()
    contractAddress?: string;
  
    @IsOptional()
    @IsString()
    tokenId?: string;
  
    @IsString()
    symbol: string;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    decimals?: number;
  
    @IsString()
    balanceRaw: string;
  
    @IsNumber()
    @Min(0)
    balanceFormatted: number;
  
    @IsOptional()
    @IsNumber()
    @Min(0)
    usdValue?: number;
  
    @IsString()
    walletAddress: string;
  
    @IsOptional()
    @IsString()
    addressType?: string;
  
    @IsOptional()
    @IsString()
    derivationPath?: string;
  }