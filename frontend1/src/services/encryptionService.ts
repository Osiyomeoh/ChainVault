import CryptoJS from 'crypto-js';

class EncryptionService {
  private getEncryptionKey(): string {
    // In production, this should be derived from user's private key or session
    return 'secure-encryption-key-from-user-session';
  }

  async encryptData(data: string): Promise<string> {
    try {
      const key = this.getEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(data, key).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    try {
      const key = this.getEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  generateHash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  generateVaultId(): string {
    return CryptoJS.lib.WordArray.random(16).toString();
  }
}

export const encryptionService = new EncryptionService();
