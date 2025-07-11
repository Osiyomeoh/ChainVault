import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { VaultAsset, AssetType } from './entities/vault-asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { BitcoinService } from '../blockchain/services/bitcoin.service';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectRepository(VaultAsset)
    private assetRepository: Repository<VaultAsset>,
    @InjectQueue('asset-monitoring') private monitoringQueue: Queue,
    private bitcoinService: BitcoinService,
  ) {}

  async create(vaultId: string, createAssetDto: CreateAssetDto): Promise<VaultAsset> {
    const asset = this.assetRepository.create({
      vaultId,
      ...createAssetDto,
    });

    const savedAsset = await this.assetRepository.save(asset);

    // Queue asset monitoring
    await this.scheduleAssetMonitoring(savedAsset);

    this.logger.log(`Asset created for vault ${vaultId}: ${savedAsset.id}`);
    return savedAsset;
  }

  async findByVault(vaultId: string): Promise<VaultAsset[]> {
    return this.assetRepository.find({
      where: { vaultId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, vaultId: string): Promise<VaultAsset> {
    const asset = await this.assetRepository.findOne({
      where: { id, vaultId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(id: string, vaultId: string, updateAssetDto: UpdateAssetDto): Promise<VaultAsset> {
    const asset = await this.findOne(id, vaultId);
    Object.assign(asset, updateAssetDto);
    return this.assetRepository.save(asset);
  }

  async remove(id: string, vaultId: string): Promise<void> {
    const asset = await this.findOne(id, vaultId);
    await this.assetRepository.remove(asset);
    this.logger.log(`Asset ${id} removed from vault ${vaultId}`);
  }

  async updateAssetBalance(
    vaultId: string,
    blockchain: string,
    address: string,
    balance: number,
  ): Promise<void> {
    await this.assetRepository.update(
      { vaultId, blockchain, walletAddress: address },
      {
        balanceRaw: balance.toString(),
        balanceFormatted: balance / Math.pow(10, 8), // Assuming 8 decimals for now
        lastUpdated: new Date(),
      },
    );
  }

  async getTotalValue(vaultId: string): Promise<number> {
    const result = await this.assetRepository
      .createQueryBuilder('asset')
      .select('SUM(asset.usdValue)', 'total')
      .where('asset.vaultId = :vaultId', { vaultId })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  async getAssetsByBlockchain(vaultId: string, blockchain: string): Promise<VaultAsset[]> {
    return this.assetRepository.find({
      where: { vaultId, blockchain },
      order: { usdValue: 'DESC' },
    });
  }

  async refreshAssetBalances(vaultId: string): Promise<void> {
    const assets = await this.findByVault(vaultId);
    
    for (const asset of assets) {
      await this.scheduleAssetMonitoring(asset);
    }

    this.logger.log(`Scheduled balance refresh for ${assets.length} assets in vault ${vaultId}`);
  }

  private async scheduleAssetMonitoring(asset: VaultAsset): Promise<void> {
    if (asset.blockchain === 'bitcoin') {
      await this.monitoringQueue.add('monitor-bitcoin-address', {
        assetId: asset.id,
        vaultId: asset.vaultId,
        address: asset.walletAddress,
      });
    }
    // Add other blockchain monitoring here
  }
}