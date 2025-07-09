import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  
  constructor(private configService: ConfigService) {}

  async encrypt(data: any, keyId: string): Promise<string> {
    const key = this.deriveKey(keyId);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from(keyId));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    });
  }
  
  async decrypt(encryptedData: string, keyId: string): Promise<any> {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    const key = this.deriveKey(keyId);
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from(keyId));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  private deriveKey(keyId: string): Buffer {
    const masterKey = this.configService.get('ENCRYPTION_KEY');
    return crypto.scryptSync(keyId, masterKey, 32);
  }
}
