import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource } from 'typeorm';
  import { ConfigService } from '@nestjs/config';
  import { InjectQueue } from '@nestjs/bull';
  import { Queue } from 'bull';
  import { v4 as uuidv4 } from 'uuid';
  
  import { Vault, VaultStatus } from './entities/vault.entity';
  import { Beneficiary } from './entities/beneficiary.entity';
  import { CreateVaultDto } from './dto/create-vault.dto';
  import { UpdateVaultDto } from './dto/update-vault.dto';
  import { QueryVaultsDto } from './dto/query-vaults.dto';
  import { EncryptionService } from '../common/services/encryption.service';
  import { StacksService } from '../blockchain/services/stacks.service';
  import { ProofOfLifeService } from '../proof-of-life/proof-of-life.service';
  
  @Injectable()
  export class VaultsService {
    private readonly logger = new Logger(VaultsService.name);
  
    constructor(
      @InjectRepository(Vault)
      private vaultRepository: Repository<Vault>,
      @InjectRepository(Beneficiary)
      private beneficiaryRepository: Repository<Beneficiary>,
      private dataSource: DataSource,
      private encryptionService: EncryptionService,
      private stacksService: StacksService,
      private proofOfLifeService: ProofOfLifeService,
      private configService: ConfigService,
      @InjectQueue('vault-deployment') private deploymentQueue: Queue,
    ) {}
  
    async create(userId: string, createVaultDto: CreateVaultDto): Promise<Vault> {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
      try {
        this.logger.log(`Creating vault for user ${userId}`);
  
        // Generate unique vault ID
        const vaultId = `vault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
        // Encrypt sensitive data
        const assetConfigEncrypted = await this.encryptionService.encrypt(
          createVaultDto.assetConfiguration,
          userId,
        );
  
        const beneficiaryConfigEncrypted = await this.encryptionService.encrypt(
          createVaultDto.beneficiaryConfiguration,
          userId,
        );
  
        // Create vault entity
        const vault = queryRunner.manager.create(Vault, {
          vaultId,
          ownerId: userId,
          name: createVaultDto.basicInfo.name,
          description: createVaultDto.basicInfo.description,
          privacyLevel: createVaultDto.basicInfo.privacyLevel,
          inheritanceDelayDays: createVaultDto.basicInfo.inheritanceDelay,
          checkInFrequencyDays: createVaultDto.basicInfo.checkInFrequency,
          status: VaultStatus.DRAFT,
          assetConfigEncrypted,
          beneficiaryConfigEncrypted,
        });
  
        const savedVault = await queryRunner.manager.save(vault);
  
        // Create beneficiaries
        if (createVaultDto.beneficiaryConfiguration?.beneficiaries) {
          for (const [index, beneficiaryData] of createVaultDto.beneficiaryConfiguration.beneficiaries.entries()) {
            const encryptedPersonalInfo = await this.encryptionService.encrypt(
              beneficiaryData,
              userId,
            );
  
            const beneficiary = queryRunner.manager.create(Beneficiary, {
              vaultId: savedVault.id,
              beneficiaryIndex: index,
              encryptedPersonalInfo,
              encryptionKeyId: userId,
              allocationPercentage: beneficiaryData.allocationPercentage || 0,
              allocationConditions: beneficiaryData.allocationConditions || {},
              preferredBlockchain: beneficiaryData.preferredBlockchain,
              walletAddress: beneficiaryData.walletAddress,
              privacySettings: beneficiaryData.privacySettings || {},
              communicationPreferences: beneficiaryData.communicationPreferences || {},
            });
  
            await queryRunner.manager.save(beneficiary);
          }
        }
  
        // Queue smart contract deployment
        await this.deploymentQueue.add('deploy-vault', {
          vaultId: savedVault.id,
          contractVaultId: vaultId,
          inheritanceDelay: createVaultDto.basicInfo.inheritanceDelay * 144, // Convert days to blocks
          privacyLevel: createVaultDto.basicInfo.privacyLevel,
          bitcoinAddressesHash: await this.generateHash(createVaultDto.assetConfiguration),
          beneficiariesHash: await this.generateHash(createVaultDto.beneficiaryConfiguration),
          gracePeriod: 144, // 1 day grace period
        });
  
        await queryRunner.commitTransaction();
        
        this.logger.log(`Vault created successfully: ${savedVault.id}`);
        return savedVault;
  
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Failed to create vault: ${error.message}`, error.stack);
        throw error;
      } finally {
        await queryRunner.release();
      }
    }
  
    async findAllByUser(userId: string, query: QueryVaultsDto): Promise<{ vaults: Vault[]; total: number }> {
      const queryBuilder = this.vaultRepository
        .createQueryBuilder('vault')
        .leftJoinAndSelect('vault.proofOfLife', 'proofOfLife')
        .leftJoinAndSelect('vault.assets', 'assets')
        .where('vault.ownerId = :userId', { userId });
  
      if (query.status) {
        queryBuilder.andWhere('vault.status = :status', { status: query.status });
      }
  
      if (query.privacyLevel) {
        queryBuilder.andWhere('vault.privacyLevel = :privacyLevel', {
          privacyLevel: query.privacyLevel,
        });
      }
  
      if (query.search) {
        queryBuilder.andWhere(
          '(vault.name ILIKE :search OR vault.description ILIKE :search)',
          { search: `%${query.search}%` }
        );
      }
  
      const total = await queryBuilder.getCount();
  
      const vaults = await queryBuilder
        .orderBy('vault.createdAt', 'DESC')
        .limit(query.limit || 10)
        .offset(query.offset || 0)
        .getMany();
  
      return { vaults, total };
    }
  
    async findOneByUser(id: string, userId: string): Promise<Vault> {
      const vault = await this.vaultRepository.findOne({
        where: { id, ownerId: userId },
        relations: ['assets', 'beneficiaries', 'proofOfLife'],
      });
  
      if (!vault) {
        throw new NotFoundException('Vault not found');
      }
  
      return vault;
    }
  
    async update(id: string, userId: string, updateVaultDto: UpdateVaultDto): Promise<Vault> {
      const vault = await this.findOneByUser(id, userId);
  
      if (vault.status === VaultStatus.INHERITED) {
        throw new BadRequestException('Cannot update inherited vault');
      }
  
      // Update basic info
      if (updateVaultDto.basicInfo) {
        Object.assign(vault, updateVaultDto.basicInfo);
      }
  
      // Update encrypted configurations if provided
      if (updateVaultDto.assetConfiguration) {
        vault.assetConfigEncrypted = await this.encryptionService.encrypt(
          updateVaultDto.assetConfiguration,
          userId,
        );
      }
  
      if (updateVaultDto.beneficiaryConfiguration) {
        vault.beneficiaryConfigEncrypted = await this.encryptionService.encrypt(
          updateVaultDto.beneficiaryConfiguration,
          userId,
        );
      }
  
      this.logger.log(`Updating vault ${id} for user ${userId}`);
      return this.vaultRepository.save(vault);
    }
  
    async remove(id: string, userId: string): Promise<void> {
      const vault = await this.findOneByUser(id, userId);
  
      if (vault.status === VaultStatus.ACTIVE) {
        throw new BadRequestException('Cannot delete active vault. Pause it first.');
      }
  
      await this.vaultRepository.remove(vault);
      this.logger.log(`Vault ${id} deleted by user ${userId}`);
    }
  
    async deployToBlockchain(id: string, userId: string): Promise<any> {
      const vault = await this.findOneByUser(id, userId);
  
      if (vault.status !== VaultStatus.DRAFT) {
        throw new BadRequestException('Vault is already deployed');
      }
  
      // Deploy to Stacks blockchain
      const result = await this.stacksService.deployVault({
        vaultId: vault.vaultId,
        inheritanceDelay: vault.inheritanceDelayDays * 144,
        privacyLevel: vault.privacyLevel,
        bitcoinAddressesHash: Buffer.from('placeholder'), // TODO: Generate actual hash
        beneficiariesHash: Buffer.from('placeholder'), // TODO: Generate actual hash
        gracePeriod: 144,
      });
  
      // Update vault with deployment info
      vault.contractAddresses = { stacks: result.contractAddress };
      vault.deploymentTransactions = { stacks: result.transactionId };
      vault.status = VaultStatus.ACTIVE;
  
      await this.vaultRepository.save(vault);
  
      // Initialize proof of life
      await this.proofOfLifeService.initialize(vault.id, {
        inheritanceDelay: vault.inheritanceDelayDays,
        checkInFrequency: vault.checkInFrequencyDays,
      });
  
      this.logger.log(`Vault ${id} deployed to blockchain`);
      return result;
    }
  
    async getVaultStatus(id: string, userId: string): Promise<any> {
      const vault = await this.findOneByUser(id, userId);
      return this.stacksService.getVaultStatus(vault.vaultId);
    }
  
    async pauseVault(id: string, userId: string): Promise<Vault> {
      const vault = await this.findOneByUser(id, userId);
      
      if (vault.status !== VaultStatus.ACTIVE) {
        throw new BadRequestException('Can only pause active vaults');
      }
  
      vault.status = VaultStatus.PAUSED;
      return this.vaultRepository.save(vault);
    }
  
    async resumeVault(id: string, userId: string): Promise<Vault> {
      const vault = await this.findOneByUser(id, userId);
      
      if (vault.status !== VaultStatus.PAUSED) {
        throw new BadRequestException('Can only resume paused vaults');
      }
  
      vault.status = VaultStatus.ACTIVE;
      return this.vaultRepository.save(vault);
    }
  
    async getDecryptedAssetConfig(vaultId: string, userId: string): Promise<any> {
      const vault = await this.findOneByUser(vaultId, userId);
      
      if (!vault.assetConfigEncrypted) {
        return null;
      }
  
      return this.encryptionService.decrypt(vault.assetConfigEncrypted, userId);
    }
  
    async getDecryptedBeneficiaryConfig(vaultId: string, userId: string): Promise<any> {
      const vault = await this.findOneByUser(vaultId, userId);
      
      if (!vault.beneficiaryConfigEncrypted) {
        return null;
      }
  
      return this.encryptionService.decrypt(vault.beneficiaryConfigEncrypted, userId);
    }
  
    private async generateHash(data: any): Promise<Buffer> {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(JSON.stringify(data)).digest();
    }
  }