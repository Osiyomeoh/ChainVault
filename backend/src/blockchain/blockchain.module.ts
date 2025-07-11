import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { StacksService } from './services/stacks.service';
import { BitcoinService } from './services/bitcoin.service';
import { BlockchainMonitorService } from './services/blockchain-monitor.service';
import { BlockchainController } from './blockchain.controller';
import { AssetMonitoringProcessor } from './processors/asset-monitoring.processor';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    BullModule.registerQueue({
      name: 'asset-monitoring',
    }),
    BullModule.registerQueue({
      name: 'blockchain-sync',
    }),
  ],
  providers: [
    StacksService,
    BitcoinService,
    BlockchainMonitorService,
    AssetMonitoringProcessor,
  ],
  controllers: [BlockchainController],
  exports: [StacksService, BitcoinService, BlockchainMonitorService],
})
export class BlockchainModule {}