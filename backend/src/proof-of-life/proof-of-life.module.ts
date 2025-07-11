import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ProofOfLife } from './entities/proof-of-life.entity';
import { ProofOfLifeService } from './proof-of-life.service';
import { ProofOfLifeController } from './proof-of-life.controller';
import { ProofOfLifeProcessor } from './processors/proof-of-life.processor';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProofOfLife]),
    BullModule.registerQueue({
      name: 'proof-of-life',
    }),
    forwardRef(() => BlockchainModule),
    forwardRef(() => NotificationsModule),
  ],
  providers: [ProofOfLifeService, ProofOfLifeProcessor],
  controllers: [ProofOfLifeController],
  exports: [ProofOfLifeService],
})
export class ProofOfLifeModule {}