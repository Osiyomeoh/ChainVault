import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendTemplateEmail(
    to: string,
    subject: string,
    template: string,
    data: any,
  ): Promise<void> {
    // Implementation would use SendGrid or similar service
    this.logger.log(`Sending email to ${to} with template ${template}`);
    
    // For now, just log the email details
    console.log({
      to,
      subject,
      template,
      data,
    });
  }

  async sendPlainEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<void> {
    this.logger.log(`Sending plain email to ${to}`);
    
    // Implementation would send actual email
    console.log({
      to,
      subject,
      content,
    });
  }
}