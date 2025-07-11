import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { VaultAsset } from './entities/vault-asset.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VaultAsset]),
    BullModule.registerQueue({
      name: 'asset-monitoring',
    }),
    BlockchainModule,
  ],
  providers: [AssetsService],
  controllers: [AssetsController],
  exports: [AssetsService],
})
export class AssetsModule {}