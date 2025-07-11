import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private emailService: EmailService) {}

  async sendProofOfLifeReminder(
    email: string,
    vaultName: string,
    daysRemaining: number,
  ): Promise<void> {
    const subject = `ChainVault: Proof of Life Required - ${vaultName}`;
    const template = 'proof-of-life-reminder';
    const data = {
      vaultName,
      daysRemaining,
    };

    await this.emailService.sendTemplateEmail(email, subject, template, data);
    this.logger.log(`Proof of life reminder sent to ${email}`);
  }

  async sendInheritanceNotification(
    email: string,
    beneficiaryName: string,
    vaultName: string,
  ): Promise<void> {
    const subject = `ChainVault: Inheritance Notification`;
    const template = 'inheritance-notification';
    const data = {
      beneficiaryName,
      vaultName,
    };

    await this.emailService.sendTemplateEmail(email, subject, template, data);
    this.logger.log(`Inheritance notification sent to ${email}`);
  }
}