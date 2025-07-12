import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BitcoinService } from '../services/bitcoin.service';
import { AssetsService } from '../../assets/assets.service';

@Processor('asset-monitoring')
export class AssetMonitoringProcessor {
  private readonly logger = new Logger(AssetMonitoringProcessor.name);

  constructor(
    private bitcoinService: BitcoinService,
    private assetsService: AssetsService,
  ) {}

  @Process('monitor-bitcoin-address')
  async handleBitcoinMonitoring(job: Job<{ assetId: string; vaultId: string; address: string }>) {
    const { assetId, vaultId, address } = job.data;
    
    this.logger.log(`Monitoring Bitcoin address ${address} for vault ${vaultId}`);

    try {
      const addressInfo = await this.bitcoinService.getAddressInfo(address);
      
      await this.assetsService.updateAssetBalance(
        vaultId,
        'bitcoin',
        address,
        addressInfo.balance,
      );

      this.logger.log(`Updated Bitcoin balance for address ${address}: ${addressInfo.balance} satoshis`);
    } catch (error) {
      this.logger.error(`Failed to monitor Bitcoin address ${address}: ${error.message}`);
      throw error;
    }
  }

  @Process('check-inheritance-triggers')
  async handleInheritanceCheck(job: Job<{ vaultId: string }>) {
    const { vaultId } = job.data;
    
    this.logger.log(`Checking inheritance triggers for vault ${vaultId}`);
    
    // Implementation for checking if inheritance should be triggered
    // This would check proof-of-life status and trigger inheritance if needed
  }
}