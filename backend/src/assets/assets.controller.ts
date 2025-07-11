import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { AssetsService } from './assets.service';
  import { CreateAssetDto } from './dto/create-asset.dto';
  import { UpdateAssetDto } from './dto/update-asset.dto';
  
  @Controller('vaults/:vaultId/assets')
  @UseGuards(JwtAuthGuard)
  export class AssetsController {
    constructor(private readonly assetsService: AssetsService) {}
  
    @Post()
    async create(
      @Param('vaultId') vaultId: string,
      @Body() createAssetDto: CreateAssetDto,
    ) {
      return this.assetsService.create(vaultId, createAssetDto);
    }
  
    @Get()
    async findAll(@Param('vaultId') vaultId: string) {
      return this.assetsService.findByVault(vaultId);
    }
  
    @Get('total-value')
    async getTotalValue(@Param('vaultId') vaultId: string) {
      const total = await this.assetsService.getTotalValue(vaultId);
      return { totalValue: total };
    }
  
    @Get('by-blockchain/:blockchain')
    async getByBlockchain(
      @Param('vaultId') vaultId: string,
      @Param('blockchain') blockchain: string,
    ) {
      return this.assetsService.getAssetsByBlockchain(vaultId, blockchain);
    }
  
    @Post('refresh')
    async refreshBalances(@Param('vaultId') vaultId: string) {
      await this.assetsService.refreshAssetBalances(vaultId);
      return { message: 'Asset balance refresh scheduled' };
    }
  
    @Get(':id')
    async findOne(
      @Param('vaultId') vaultId: string,
      @Param('id') id: string,
    ) {
      return this.assetsService.findOne(id, vaultId);
    }
  
    @Patch(':id')
    async update(
      @Param('vaultId') vaultId: string,
      @Param('id') id: string,
      @Body() updateAssetDto: UpdateAssetDto,
    ) {
      return this.assetsService.update(id, vaultId, updateAssetDto);
    }
  
    @Delete(':id')
    async remove(
      @Param('vaultId') vaultId: string,
      @Param('id') id: string,
    ) {
      await this.assetsService.remove(id, vaultId);
      return { message: 'Asset removed successfully' };
    }
  }