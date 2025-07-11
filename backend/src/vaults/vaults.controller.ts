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
    Query,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { VaultsService } from './vaults.service';
  import { CreateVaultDto } from './dto/create-vault.dto';
  import { UpdateVaultDto } from './dto/update-vault.dto';
  import { QueryVaultsDto } from './dto/query-vaults.dto';
  
  @Controller('vaults')
  @UseGuards(JwtAuthGuard)
  export class VaultsController {
    constructor(private readonly vaultsService: VaultsService) {}
  
    @Post()
    async create(@Request() req, @Body() createVaultDto: CreateVaultDto) {
      return this.vaultsService.create(req.user.id, createVaultDto);
    }
  
    @Get()
    async findAll(@Request() req, @Query() query: QueryVaultsDto) {
      return this.vaultsService.findAllByUser(req.user.id, query);
    }
  
    @Get(':id')
    async findOne(@Request() req, @Param('id') id: string) {
      return this.vaultsService.findOneByUser(id, req.user.id);
    }
  
    @Patch(':id')
    async update(
      @Request() req,
      @Param('id') id: string,
      @Body() updateVaultDto: UpdateVaultDto,
    ) {
      return this.vaultsService.update(id, req.user.id, updateVaultDto);
    }
  
    @Delete(':id')
    async remove(@Request() req, @Param('id') id: string) {
      await this.vaultsService.remove(id, req.user.id);
      return { message: 'Vault deleted successfully' };
    }
  
    @Post(':id/deploy')
    async deploy(@Request() req, @Param('id') id: string) {
      return this.vaultsService.deployToBlockchain(id, req.user.id);
    }
  
    @Get(':id/status')
    async getStatus(@Request() req, @Param('id') id: string) {
      return this.vaultsService.getVaultStatus(id, req.user.id);
    }
  
    @Post(':id/pause')
    @HttpCode(HttpStatus.OK)
    async pause(@Request() req, @Param('id') id: string) {
      return this.vaultsService.pauseVault(id, req.user.id);
    }
  
    @Post(':id/resume')
    @HttpCode(HttpStatus.OK)
    async resume(@Request() req, @Param('id') id: string) {
      return this.vaultsService.resumeVault(id, req.user.id);
    }
  
    @Get(':id/assets-config')
    async getAssetsConfig(@Request() req, @Param('id') id: string) {
      return this.vaultsService.getDecryptedAssetConfig(id, req.user.id);
    }
  
    @Get(':id/beneficiaries-config')
    async getBeneficiariesConfig(@Request() req, @Param('id') id: string) {
      return this.vaultsService.getDecryptedBeneficiaryConfig(id, req.user.id);
    }
  }