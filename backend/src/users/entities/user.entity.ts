import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Exclude } from 'class-transformer';
  import { Vault } from '../../vaults/entities/vault.entity';
  
  export enum KYCStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    REQUIRES_REVIEW = 'requires_review',
  }
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    @Exclude()
    passwordHash: string;
  
    @Column({ nullable: true })
    @Exclude()
    mfaSecret?: string;
  
    @Column('jsonb', { 
      default: {
        privacyLevel: 1,
        anonymousMode: false,
        vpnRequired: false,
        encryptedCommunications: true
      }
    })
    privacyPreferences: {
      privacyLevel: number;
      anonymousMode: boolean;
      vpnRequired: boolean;
      encryptedCommunications: boolean;
    };
  
    @Column({
      type: 'enum',
      enum: KYCStatus,
      default: KYCStatus.PENDING,
    })
    kycStatus: KYCStatus;
  
    @Column('jsonb', { nullable: true })
    @Exclude()
    kycData?: any;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @OneToMany(() => Vault, (vault) => vault.owner)
    vaults: Vault[];
  }
  