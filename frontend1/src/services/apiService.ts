import axios from 'axios';
import { networkConfig } from '@/config';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = networkConfig.apiBaseUrl;
  }

  async storeVaultData(vaultId: string, data: any): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/vaults/${vaultId}/data`, data);
    } catch (error) {
      console.error('Failed to store vault data:', error);
      throw error;
    }
  }

  async getVaultData(vaultId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/vaults/${vaultId}/data`);
      return response.data;
    } catch (error) {
      console.error('Failed to get vault data:', error);
      throw error;
    }
  }

  async getUserVaults(userAddress: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseURL}/users/${userAddress}/vaults`);
      return response.data.vaultIds || [];
    } catch (error) {
      console.error('Failed to get user vaults:', error);
      return [];
    }
  }

  async updateProofOfLife(vaultId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseURL}/vaults/${vaultId}/proof-of-life`);
      return response.data.success || false;
    } catch (error) {
      console.error('Failed to update proof of life:', error);
      return false;
    }
  }

  async getNotifications(userAddress: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/users/${userAddress}/notifications`);
      return response.data.notifications || [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();