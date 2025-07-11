import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProofOfLife, ProofOfLifeStatus } from './entities/proof-of-life.entity';
import { StacksService } from '../blockchain/services/stacks.service';
import { NotificationsService } from '../notifications/services/notifications.service';

@Injectable()
export class ProofOfLifeService {
  private readonly logger = new Logger(ProofOfLifeService.name);

  constructor(
    @InjectRepository(ProofOfLife)
    private proofOfLifeRepository: Repository<ProofOfLife>,
    @InjectQueue('proof-of-life') private proofOfLifeQueue: Queue,
    private stacksService: StacksService,
    private notificationsService: NotificationsService,
  ) {}

  async initialize(vaultId: string, config: { inheritanceDelay: number; checkInFrequency: number }): Promise<ProofOfLife> {
    const now = new Date();
    const nextDeadline = new Date(now.getTime() + config.checkInFrequency * 24 * 60 * 60 * 1000);
    const gracePeriodEnd = new Date(nextDeadline.getTime() + config.inheritanceDelay * 24 * 60 * 60 * 1000);

    const proofOfLife = this.proofOfLifeRepository.create({
      vaultId,
      lastCheckIn: now,
      nextDeadline,
      gracePeriodEnd,
      status: ProofOfLifeStatus.ACTIVE,
    });

    const saved = await this.proofOfLifeRepository.save(proofOfLife);

    // Schedule reminder notifications
    await this.scheduleReminders(saved);

    this.logger.log(`Proof of life initialized for vault ${vaultId}`);
    return saved;
  }

  async updateCheckIn(vaultId: string, userId: string): Promise<ProofOfLife> {
    const proofOfLife = await this.findByVaultId(vaultId);
    
    const now = new Date();
    
    // Update local proof of life
    proofOfLife.lastCheckIn = now;
    proofOfLife.status = ProofOfLifeStatus.ACTIVE;
    proofOfLife.reminderCount = 0;
    proofOfLife.lastReminderSent = null;

    // Calculate next deadline based on vault's check-in frequency
    // This would typically come from the vault entity
    const checkInFrequencyDays = 7; // Default to weekly, should get from vault
    proofOfLife.nextDeadline = new Date(now.getTime() + checkInFrequencyDays * 24 * 60 * 60 * 1000);

    const updated = await this.proofOfLifeRepository.save(proofOfLife);

    // Update on blockchain (this would require user's private key in a real implementation)
    try {
      // await this.stacksService.updateProofOfLife(vaultId, userPrivateKey);
      this.logger.log(`Proof of life updated on blockchain for vault ${vaultId}`);
    } catch (error) {
      this.logger.error(`Failed to update proof of life on blockchain: ${error.message}`);
    }

    // Reschedule reminders
    await this.scheduleReminders(updated);

    this.logger.log(`Proof of life updated for vault ${vaultId}`);
    return updated;
  }

  async findByVaultId(vaultId: string): Promise<ProofOfLife> {
    const proofOfLife = await this.proofOfLifeRepository.findOne({
      where: { vaultId },
      relations: ['vault'],
    });

    if (!proofOfLife) {
      throw new NotFoundException('Proof of life record not found');
    }

    return proofOfLife;
  }

  async getStatus(vaultId: string): Promise<{
    status: ProofOfLifeStatus;
    lastCheckIn: Date;
    nextDeadline: Date;
    daysUntilDeadline: number;
    gracePeriodEnd?: Date;
  }> {
    const proofOfLife = await this.findByVaultId(vaultId);
    const now = new Date();
    const daysUntilDeadline = Math.ceil((proofOfLife.nextDeadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    return {
      status: proofOfLife.status,
      lastCheckIn: proofOfLife.lastCheckIn,
      nextDeadline: proofOfLife.nextDeadline,
      daysUntilDeadline,
      gracePeriodEnd: proofOfLife.gracePeriodEnd,
    };
  }

  // Cron job to check for expired proof of life
  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredProofOfLife(): Promise<void> {
    this.logger.log('Checking for expired proof of life records');

    const now = new Date();
    
    // Find vaults that have passed their deadline
    const expiredRecords = await this.proofOfLifeRepository
      .createQueryBuilder('pol')
      .where('pol.nextDeadline < :now', { now })
      .andWhere('pol.status IN (:...statuses)', { statuses: [ProofOfLifeStatus.ACTIVE, ProofOfLifeStatus.WARNING] })
      .getMany();

    for (const record of expiredRecords) {
      if (record.gracePeriodEnd && now > record.gracePeriodEnd) {
        // Grace period has also expired - trigger inheritance
        await this.triggerInheritance(record);
      } else {
        // Move to grace period
        record.status = ProofOfLifeStatus.GRACE_PERIOD;
        await this.proofOfLifeRepository.save(record);
        
        // Send urgent notifications
        await this.sendGracePeriodNotification(record);
      }
    }

    // Check for upcoming deadlines and send warnings
    const warningThreshold = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const warningRecords = await this.proofOfLifeRepository
      .createQueryBuilder('pol')
      .where('pol.nextDeadline BETWEEN :now AND :threshold', { now, threshold: warningThreshold })
      .andWhere('pol.status = :status', { status: ProofOfLifeStatus.ACTIVE })
      .getMany();

    for (const record of warningRecords) {
      record.status = ProofOfLifeStatus.WARNING;
      await this.proofOfLifeRepository.save(record);
      await this.sendWarningNotification(record);
    }
  }

  private async scheduleReminders(proofOfLife: ProofOfLife): Promise<void> {
    const vaultId = proofOfLife.vaultId;
    
    // Schedule reminder 3 days before deadline
    const reminderDate = new Date(proofOfLife.nextDeadline.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    await this.proofOfLifeQueue.add(
      'send-reminder',
      { vaultId, type: 'warning' },
      { delay: Math.max(0, reminderDate.getTime() - Date.now()) }
    );

    // Schedule urgent reminder 1 day before deadline
    const urgentReminderDate = new Date(proofOfLife.nextDeadline.getTime() - 24 * 60 * 60 * 1000);
    
    await this.proofOfLifeQueue.add(
      'send-reminder',
      { vaultId, type: 'urgent' },
      { delay: Math.max(0, urgentReminderDate.getTime() - Date.now()) }
    );
  }

  private async triggerInheritance(proofOfLife: ProofOfLife): Promise<void> {
    this.logger.log(`Triggering inheritance for vault ${proofOfLife.vaultId}`);
    
    proofOfLife.status = ProofOfLifeStatus.EXPIRED;
    await this.proofOfLifeRepository.save(proofOfLife);

    // Trigger blockchain inheritance
    try {
      await this.stacksService.triggerInheritance(proofOfLife.vaultId);
    } catch (error) {
      this.logger.error(`Failed to trigger inheritance on blockchain: ${error.message}`);
    }

    // Notify beneficiaries based on privacy settings
    await this.notifyBeneficiaries(proofOfLife);
  }

  private async sendWarningNotification(proofOfLife: ProofOfLife): Promise<void> {
    // Implementation would send email/SMS warning
    this.logger.log(`Sending warning notification for vault ${proofOfLife.vaultId}`);
  }

  private async sendGracePeriodNotification(proofOfLife: ProofOfLife): Promise<void> {
    // Implementation would send urgent notification
    this.logger.log(`Sending grace period notification for vault ${proofOfLife.vaultId}`);
  }

  private async notifyBeneficiaries(proofOfLife: ProofOfLife): Promise<void> {
    // Implementation would notify beneficiaries based on privacy level
    this.logger.log(`Notifying beneficiaries for vault ${proofOfLife.vaultId}`);
  }
}
