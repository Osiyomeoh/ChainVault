import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
    Body,
  } from '@nestjs/common';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { StacksService } from './services/stacks.service';
  import { BitcoinService } from './services/bitcoin.service';
  
  @Controller('blockchain')
  @UseGuards(JwtAuthGuard)
  export class BlockchainController {
    constructor(
      private readonly stacksService: StacksService,
      private readonly bitcoinService: BitcoinService,
    ) {}
  
    @Get('bitcoin/network-info')
    async getBitcoinNetworkInfo() {
      return this.bitcoinService.getNetworkInfo();
    }
  
    @Get('bitcoin/address/:address')
    async getBitcoinAddressInfo(@Param('address') address: string) {
      return this.bitcoinService.getAddressInfo(address);
    }
  
    @Get('bitcoin/address/:address/transactions')
    async getBitcoinTransactions(@Param('address') address: string) {
      return this.bitcoinService.getAddressTransactions(address);
    }
  
    @Post('bitcoin/validate-address')
    async validateBitcoinAddress(@Body() body: { address: string }) {
      const isValid = await this.bitcoinService.validateAddress(body.address);
      return { address: body.address, isValid };
    }
  
    @Get('stacks/vault/:vaultId/status')
    async getVaultStatus(@Param('vaultId') vaultId: string) {
      return this.stacksService.getVaultStatus(vaultId);
    }
  
    @Get('stacks/vault/:vaultId/proof-of-life')
    async getProofOfLifeStatus(@Param('vaultId') vaultId: string) {
      return this.stacksService.getProofOfLifeStatus(vaultId);
    }
  }
  