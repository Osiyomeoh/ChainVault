import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  import { Vault } from '../../vaults/entities/vault.entity';
  
  export enum ProofOfLifeStatus {
    ACTIVE = 'active',
    WARNING = 'warning',
    GRACE_PERIOD = 'grace_period',
    EXPIRED = 'expired',
  }
  
  @Entity('proof_of_life')
  export class ProofOfLife {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    vaultId: string;
  
    @Column()
    lastCheckIn: Date;
  
    @Column()
    nextDeadline: Date;
  
    @Column({ nullable: true })
    gracePeriodEnd?: Date;
  
    @Column({
      type: 'enum',
      enum: ProofOfLifeStatus,
      default: ProofOfLifeStatus.ACTIVE,
    })
    status: ProofOfLifeStatus;
  
    @Column({ default: 0 })
    reminderCount: number;
  
    @Column({ nullable: true })
    lastReminderSent?: Date;
  
    @Column('jsonb', { default: {} })
    crossChainSyncStatus?: any;
  
    @Column({ nullable: true })
    lastCrossChainUpdate?: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @OneToOne(() => Vault, (vault) => vault.proofOfLife, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;
  }