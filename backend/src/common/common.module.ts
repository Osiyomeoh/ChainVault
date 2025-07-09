import { Module } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { HashingService } from './services/hashing.service';
import { ValidationService } from './services/validation.service';

@Module({
  providers: [EncryptionService, HashingService, ValidationService],
  exports: [EncryptionService, HashingService, ValidationService],
})
export class CommonModule {}