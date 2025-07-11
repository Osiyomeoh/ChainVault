// File: src/vaults/vaults.module.ts
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

// File: src/vaults/entities/vault.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { VaultAsset } from '../../assets/entities/vault-asset.entity';
import { Beneficiary } from './beneficiary.entity';
import { ProofOfLife } from '../../proof-of-life/entities/proof-of-life.entity';

export enum VaultStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  WARNING = 'warning',
  GRACE_PERIOD = 'grace_period',
  EXPIRED = 'expired',
  INHERITED = 'inherited',
  PAUSED = 'paused',
}

export enum PrivacyLevel {
  STEALTH = 1,
  DELAYED = 2,
  EDUCATIONAL = 3,
  TRANSPARENT = 4,
}

@Entity('vaults')
export class Vault {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 36 })
  vaultId: string; // Smart contract vault ID

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: PrivacyLevel,
  })
  privacyLevel: PrivacyLevel;

  @Column()
  inheritanceDelayDays: number;

  @Column()
  checkInFrequencyDays: number;

  @Column({
    type: 'enum',
    enum: VaultStatus,
    default: VaultStatus.DRAFT,
  })
  status: VaultStatus;

  // Blockchain data
  @Column({ default: 'stacks' })
  primaryChain: string;

  @Column('jsonb', { default: ['stacks', 'bitcoin'] })
  supportedChains: string[];

  @Column('jsonb', { default: {} })
  contractAddresses: Record<string, string>;

  @Column('jsonb', { default: {} })
  deploymentTransactions: Record<string, string>;

  // Encrypted sensitive data
  @Column('text', { nullable: true })
  assetConfigEncrypted?: string;

  @Column('text', { nullable: true })
  beneficiaryConfigEncrypted?: string;

  @Column('text', { nullable: true })
  legalConfigEncrypted?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.vaults, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column()
  ownerId: string;

  @OneToMany(() => VaultAsset, (asset) => asset.vault)
  assets: VaultAsset[];

  @OneToMany(() => Beneficiary, (beneficiary) => beneficiary.vault)
  beneficiaries: Beneficiary[];

  @OneToOne(() => ProofOfLife, (proofOfLife) => proofOfLife.vault)
  proofOfLife: ProofOfLife;
}