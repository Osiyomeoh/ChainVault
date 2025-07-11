import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as bitcoin from 'bitcoinjs-lib';

export interface BitcoinAddress {
  address: string;
  type: 'legacy' | 'segwit' | 'taproot';
  balance: number;
  transactions: number;
  lastActivity?: Date;
}

export interface BitcoinTransaction {
  txid: string;
  amount: number;
  confirmations: number;
  timestamp: Date;
  type: 'received' | 'sent';
}

@Injectable()
export class BitcoinService {
  private readonly logger = new Logger(BitcoinService.name);
  private readonly apiUrl: string;
  private readonly network: bitcoin.Network;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiUrl = configService.get('bitcoinApiUrl');
    this.network =
      configService.get('bitcoinNetwork') === 'mainnet'
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet;
  }

  async getAddressInfo(address: string): Promise<BitcoinAddress> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/address/${address}`),
      );

      const data = response.data;

      return {
        address,
        type: this.getAddressType(address),
        balance: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
        transactions: data.chain_stats.tx_count,
        lastActivity: data.chain_stats.tx_count > 0 ? new Date() : undefined,
      };
    } catch (error) {
      this.logger.error(`Failed to get address info for ${address}: ${error.message}`);
      throw error;
    }
  }

  async getAddressTransactions(address: string, limit = 10): Promise<BitcoinTransaction[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/address/${address}/txs`),
      );

      return response.data.slice(0, limit).map((tx: any) => ({
        txid: tx.txid,
        amount: this.calculateTransactionAmount(tx, address),
        confirmations: tx.status.confirmed ? tx.status.block_height : 0,
        timestamp: new Date(tx.status.block_time * 1000),
        type: this.getTransactionType(tx, address),
      }));
    } catch (error) {
      this.logger.error(`Failed to get transactions for ${address}: ${error.message}`);
      throw error;
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      bitcoin.address.toOutputScript(address, this.network);
      return true;
    } catch {
      return false;
    }
  }

  async getNetworkInfo(): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/blocks/tip/height`),
      );
      return {
        blockHeight: response.data,
        network: this.configService.get('bitcoinNetwork'),
      };
    } catch (error) {
      this.logger.error(`Failed to get network info: ${error.message}`);
      throw error;
    }
  }

  async monitorAddresses(addresses: string[]): Promise<BitcoinAddress[]> {
    const results = await Promise.allSettled(
      addresses.map((address) => this.getAddressInfo(address)),
    );

    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<BitcoinAddress>).value);
  }

  private getAddressType(address: string): 'legacy' | 'segwit' | 'taproot' {
    if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
      return 'legacy';
    } else if (address.startsWith('3') || address.startsWith('2')) {
      return 'segwit';
    } else if (address.startsWith('bc1') || address.startsWith('tb1')) {
      return address.length === 42 ? 'segwit' : 'taproot';
    }
    return 'legacy';
  }

  private calculateTransactionAmount(tx: any, address: string): number {
    let amount = 0;
    
    // Calculate outputs to this address
    tx.vout.forEach((output: any) => {
      if (output.scriptpubkey_address === address) {
        amount += output.value;
      }
    });

    // Subtract inputs from this address
    tx.vin.forEach((input: any) => {
      if (input.prevout && input.prevout.scriptpubkey_address === address) {
        amount -= input.prevout.value;
      }
    });

    return amount;
  }

  private getTransactionType(tx: any, address: string): 'received' | 'sent' {
    const amount = this.calculateTransactionAmount(tx, address);
    return amount > 0 ? 'received' : 'sent';
  }
}
