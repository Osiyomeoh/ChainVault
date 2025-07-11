import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
  } from 'typeorm';
  import { Vault } from '../../vaults/entities/vault.entity';
  
  export enum AssetType {
    NATIVE = 'native', // BTC, ETH, SOL
    TOKEN = 'token',   // ERC-20, SPL, etc.
    NFT = 'nft',       // ERC-721, etc.
  }
  
  @Entity('vault_assets')
  @Index(['vaultId', 'blockchain'])
  @Index(['blockchain', 'walletAddress'])
  export class VaultAsset {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    blockchain: string;
  
    @Column({
      type: 'enum',
      enum: AssetType,
    })
    assetType: AssetType;
  
    // Asset identification
    @Column({ nullable: true })
    contractAddress?: string;
  
    @Column({ nullable: true })
    tokenId?: string;
  
    @Column()
    symbol: string;
  
    @Column({ default: 8 })
    decimals: number;
  
    // Balance tracking
    @Column()
    balanceRaw: string; // Store as string to avoid precision issues
  
    @Column('decimal', { precision: 36, scale: 18 })
    balanceFormatted: number;
  
    @Column('decimal', { precision: 20, scale: 2, default: 0 })
    usdValue: number;
  
    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    lastUpdated: Date;
  
    // Address information
    @Column()
    walletAddress: string;
  
    @Column({ nullable: true })
    addressType?: string;
  
    @Column({ nullable: true })
    derivationPath?: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Relations
    @ManyToOne(() => Vault, (vault) => vault.assets, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;
  
    @Column()
    vaultId: string;
  }