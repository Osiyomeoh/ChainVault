import axios from 'axios';
import { BitcoinBalance } from '@/types';
import { networkConfig } from '@/config';

class BitcoinService {
  private baseURL: string;

  constructor() {
    this.baseURL = networkConfig.btcApiUrl;
  }

  async getAddressBalance(address: string): Promise<BitcoinBalance> {
    try {
      const response = await axios.get(`${this.baseURL}/address/${address}`);
      const data = response.data;
      
      return {
        address,
        balance: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
        unconfirmedBalance: data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum,
        totalReceived: data.chain_stats.funded_txo_sum,
        totalSent: data.chain_stats.spent_txo_sum,
        txCount: data.chain_stats.tx_count,
      };
    } catch (error) {
      console.error(`Failed to get balance for address ${address}:`, error);
      throw error;
    }
  }

  async getAddressTransactions(address: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/address/${address}/txs?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get transactions for address ${address}:`, error);
      return [];
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      // Basic Bitcoin address validation
      const regex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
      return regex.test(address);
    } catch (error) {
      return false;
    }
  }

  satoshisToBtc(satoshis: number): number {
    return satoshis / 100000000;
  }

  btcToSatoshis(btc: number): number {
    return Math.round(btc * 100000000);
  }
}

export const bitcoinService = new BitcoinService();