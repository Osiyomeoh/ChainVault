import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Vault } from './entities/vault.entity';
import { Beneficiary } from './entities/beneficiary.entity';
import { VaultsService } from './vaults.service';
import { VaultsController } from './vaults.controller';
import { CommonModule } from '../common/common.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ProofOfLifeModule } from '../proof-of-life/proof-of-life.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vault, Beneficiary]),
    BullModule.registerQueue({
      name: 'vault-deployment',
    }),
    CommonModule,
    BlockchainModule,
    ProofOfLifeModule,
  ],
  providers: [VaultsService],
  controllers: [VaultsController],
  exports: [VaultsService],
})
export class VaultsModule {}
