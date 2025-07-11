import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { ProofOfLifeService } from './proof-of-life.service';
  
  @Controller('proof-of-life')
  @UseGuards(JwtAuthGuard)
  export class ProofOfLifeController {
    constructor(private readonly proofOfLifeService: ProofOfLifeService) {}
  
    @Post('vaults/:vaultId/checkin')
    @HttpCode(HttpStatus.OK)
    async updateCheckIn(@Param('vaultId') vaultId: string, @Request() req) {
      return this.proofOfLifeService.updateCheckIn(vaultId, req.user.id);
    }
  
    @Get('vaults/:vaultId/status')
    async getStatus(@Param('vaultId') vaultId: string) {
      return this.proofOfLifeService.getStatus(vaultId);
    }
  
    @Get('vaults/:vaultId')
    async getProofOfLife(@Param('vaultId') vaultId: string) {
      return this.proofOfLifeService.findByVaultId(vaultId);
    }
  }
  
  // File: src/notifications/notifications.module.ts
  import { Module } from '@nestjs/common';
  import { ConfigModule } from '@nestjs/config';
  import { NotificationsService } from './services/notifications.service';
  import { EmailService } from './services/email.service';
  
  @Module({
    imports: [ConfigModule],
    providers: [NotificationsService, EmailService],
    exports: [NotificationsService, EmailService],
  })
  export class NotificationsModule {}