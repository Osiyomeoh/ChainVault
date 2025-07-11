import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
  } from 'typeorm';
  import { Vault } from './vault.entity';
  
  export enum NotificationStatus {
    PENDING = 'pending',
    NOTIFIED = 'notified',
    ACKNOWLEDGED = 'acknowledged',
    CLAIMED = 'claimed',
  }
  
  @Entity('beneficiaries')
  @Unique(['vault', 'beneficiaryIndex'])
  export class Beneficiary {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    beneficiaryIndex: number;
  
    // Encrypted personal data
    @Column('text')
    encryptedPersonalInfo: string;
  
    @Column()
    encryptionKeyId: string;
  
    // Inheritance configuration
    @Column('decimal', { precision: 5, scale: 2 })
    allocationPercentage: number;
  
    @Column('jsonb', { default: {} })
    allocationConditions?: any;
  
    @Column({ nullable: true })
    preferredBlockchain?: string;
  
    @Column({ nullable: true })
    walletAddress?: string;
  
    // Privacy and communication
    @Column('jsonb', { default: {} })
    privacySettings: any;
  
    @Column('jsonb', { default: {} })
    communicationPreferences: any;
  
    @Column({
      type: 'enum',
      enum: NotificationStatus,
      default: NotificationStatus.PENDING,
    })
    notificationStatus: NotificationStatus;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @ManyToOne(() => Vault, (vault) => vault.beneficiaries, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;
  
    @Column()
    vaultId: string;
  }
  