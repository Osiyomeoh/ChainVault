import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    stringUtf8CV,
    uintCV,
    bufferCV,
    boolCV,
    listCV,
    tupleCV,
    standardPrincipalCV,
    cvToString,
  cvToValue,
  PostCondition,
  ClarityValue,
  } from '@stacks/transactions';
import { StacksNetwork, STACKS_TESTNET, STACKS_MAINNET } from '@stacks/network';
import { request } from '@stacks/connect';
import { NETWORKS, DEFAULT_NETWORK } from '../config/networks';

interface SBTCBeneficiaryInput {
  address: string;
  allocationPercentage: number;
  minimumSbtcAmount: number;
}

interface InheritanceCalculation {
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
}

interface CreateVaultParams {
  vaultId: string;
  vaultName: string;
  inheritanceDelay: number;
  privacyLevel: number;
  gracePeriod: number;
  autoDistribute: boolean;
  minimumInheritance: number;
  beneficiaries: SBTCBeneficiaryInput[];
  initialSbtcAmount?: number;
  bitcoinAddresses?: string[];
  lockSbtc?: boolean;
}

class SBTCStacksService {
  private contractAddress: string;
  private contractName: string;
  private sbtcTokenAddress: string;
  private sbtcTokenName = 'mock-sbtc-token-v2';
  private network: StacksNetwork;
  private createdVaults: Map<string, any> = new Map(); // Track created vaults
  private userAddress: string | null = null; // Current user address for read-only calls

  constructor() {
    // Get network config based on your structure
    const networkConfig = NETWORKS[DEFAULT_NETWORK];
    this.contractAddress = networkConfig.contractAddress;
    this.sbtcTokenAddress = networkConfig.sbtcTokenAddress;
    
    // Set network based on DEFAULT_NETWORK
    this.network = (DEFAULT_NETWORK as string) === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
    
    // Get contract names from network configuration
    this.contractName = networkConfig.chainvaultContract.split('.')[1];
    this.sbtcTokenName = networkConfig.mockSbtcContract.split('.')[1];
  }

  // Set the current user address for read-only function calls
  setUserAddress(address: string) {
    this.userAddress = address;
  }

    // Modern transaction execution using Stacks Connect 8.x.x
  private async executeContractCall(
    functionName: string,
    functionArgs: ClarityValue[],
    postConditions: PostCondition[] = []
  ): Promise<string> {
    console.log('executeContractCall started with:', {
      functionName,
      functionArgsCount: functionArgs.length,
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      network: this.network
    });

    try {
      console.log('Using new Stacks Connect request API...');
      
      // Convert network to string format expected by request method
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      
      // Prepare contract identifier
      const contract = `${this.contractAddress}.${this.contractName}` as const;
      
      console.log('Request parameters:', {
        method: 'stx_callContract',
        contract,
        functionName,
        functionArgsCount: functionArgs.length,
        network: networkString,
        postConditionsCount: postConditions.length
      });

      // Use the new request method for contract calls
      const response = await request('stx_callContract', {
        contract,
        functionName,
        functionArgs,
        network: networkString,
        postConditions: postConditions && postConditions.length > 0 ? postConditions : undefined
      });

      console.log('Contract call successful:', response);
      return response.txid || 'transaction-submitted';
      
    } catch (error) {
      console.error('Contract call failed:', error);
      throw error;
    }
  }

  async createSBTCVault(params: CreateVaultParams | any): Promise<string> {
    // Normalize the parameters to handle different data structures
    const normalizedParams = {
      vaultId: params.vaultId || params.id || params.vault_id || '',
      vaultName: params.vaultName || params.name || params.vault_name || '',
      inheritanceDelay: params.inheritanceDelay || params.inheritance_delay || 0,
      privacyLevel: params.privacyLevel || params.privacy_level || 1,
      gracePeriod: params.gracePeriod || params.grace_period || 30,
      autoDistribute: params.autoDistribute ?? params.auto_distribute ?? true,
      minimumInheritance: params.minimumInheritance || params.minimum_inheritance || 0,
      beneficiaries: params.beneficiaries || [],
      initialSbtcAmount: params.initialSbtcAmount || params.initial_sbtc_amount || 0,
      bitcoinAddresses: params.bitcoinAddresses || params.bitcoin_addresses || [],
      lockSbtc: params.lockSbtc ?? params.lock_sbtc ?? false
    };

    // Debug logging to see exactly what's being passed
    console.log('Raw params received:', params);
    console.log('Normalized params:', normalizedParams);
    console.log('VaultId type and value:', typeof normalizedParams.vaultId, normalizedParams.vaultId);
    console.log('VaultName type and value:', typeof normalizedParams.vaultName, normalizedParams.vaultName);

    console.log('Creating sBTC vault with smart contract:', {
      vaultId: normalizedParams.vaultId,
      vaultName: normalizedParams.vaultName,
      inheritanceDelay: normalizedParams.inheritanceDelay,
      beneficiariesCount: normalizedParams.beneficiaries?.length || 0,
      initialSbtcAmount: normalizedParams.initialSbtcAmount || 0,
      bitcoinAddressesCount: normalizedParams.bitcoinAddresses?.length || 0,
      lockSbtc: normalizedParams.lockSbtc || false
    });

    // Enhanced validation with better error messages
    if (!normalizedParams.vaultId || normalizedParams.vaultId.trim() === '') {
      throw new Error(`Vault ID is required. Received: "${normalizedParams.vaultId}" (type: ${typeof normalizedParams.vaultId})`);
    }
    
    if (!normalizedParams.vaultName || normalizedParams.vaultName.trim() === '') {
      throw new Error(`Vault name is required. Received: "${normalizedParams.vaultName}" (type: ${typeof normalizedParams.vaultName})`);
    }

    // Use normalized params for the rest of the function
    const params_n = normalizedParams;

    // Ensure arrays exist with defaults
    const beneficiaries = params_n.beneficiaries || [];
    const bitcoinAddresses = params_n.bitcoinAddresses || [];

    // Validate all numeric parameters
    const numericParams = {
      inheritanceDelay: params_n.inheritanceDelay,
      privacyLevel: params_n.privacyLevel,
      gracePeriod: params_n.gracePeriod,
      minimumInheritance: params_n.minimumInheritance,
      initialSbtcAmount: params_n.initialSbtcAmount || 0
    };

    for (const [key, value] of Object.entries(numericParams)) {
      if (typeof value !== 'number' || isNaN(value)) {
        throw new Error(`Invalid ${key}: ${value}`);
      }
    }

    if (typeof params_n.autoDistribute !== 'boolean') {
      throw new Error(`Invalid auto distribute: ${params_n.autoDistribute}`);
    }
    if (typeof (params_n.lockSbtc || false) !== 'boolean') {
      throw new Error(`Invalid lock sBTC: ${params_n.lockSbtc}`);
    }

    console.log('Parameter validation passed');

    // Create hash placeholders (in real implementation, these would be proper hashes)
    const bitcoinAddressesHash = bufferCV(new Uint8Array(32).fill(0));
    const beneficiariesHash = bufferCV(new Uint8Array(32).fill(0));

    const functionArgs: ClarityValue[] = [
      stringUtf8CV(params_n.vaultId),
      stringUtf8CV(params_n.vaultName),
      uintCV(params_n.inheritanceDelay),
      uintCV(params_n.privacyLevel),
      bitcoinAddressesHash,
      beneficiariesHash,
      uintCV(params_n.gracePeriod),
      uintCV(params_n.initialSbtcAmount || 0),
      boolCV(params_n.lockSbtc || false),
      boolCV(params_n.autoDistribute)
    ];

    console.log('About to call executeContractCall...');
    
    try {
      const result = await this.executeContractCall('create-sbtc-vault', functionArgs, []);
      console.log('executeContractCall completed with result:', result);
      
      // Store the created vault data for later retrieval
      const vaultData = {
        vaultId: params_n.vaultId,
        name: params_n.vaultName,
        owner: 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX', // Your contract address
        status: 'active',
        sbtcBalance: 0,
        beneficiaries: params_n.beneficiaries || [],
        inheritanceDelay: params_n.inheritanceDelay,
        privacyLevel: params_n.privacyLevel,
        gracePeriod: params_n.gracePeriod,
        autoDistribute: params_n.autoDistribute,
        minimumInheritance: params_n.minimumInheritance,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      
      this.createdVaults.set(params_n.vaultId, vaultData);
      console.log('Stored vault data for retrieval:', vaultData);
      console.log('Current stored vaults count:', this.createdVaults.size);
      console.log('All stored vaults:', Array.from(this.createdVaults.entries()));
      
      return result;
    } catch (error) {
      console.error('executeContractCall failed:', error);
      throw error;
    }
  }

  async depositSBTC(vaultId: string, amount: number): Promise<string> {
    console.log('Depositing sBTC to vault:', { vaultId, amount });
  
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }
  
    const functionArgs: ClarityValue[] = [
      stringUtf8CV(vaultId),
      uintCV(amount)
    ];
  
    try {
      console.log('Depositing amount in sats:', amount);
      
      // Use PostConditionMode.Allow to bypass all post-condition checks
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      const contract = `${this.contractAddress}.${this.contractName}` as const;
      
      const response = await request('stx_callContract', {
        contract,
        functionName: 'deposit-sbtc',
        functionArgs,
        network: networkString,
        postConditionMode: 'allow' // This bypasses post-condition validation
      });
  
      console.log('Contract call successful:', response);
      return response.txid || 'transaction-submitted';
      
    } catch (error) {
      console.error('Failed to deposit sBTC:', error);
      throw new Error(`Failed to deposit sBTC: ${error}`);
    }
  }

  async withdrawSBTC(vaultId: string, amount: number): Promise<string> {
    console.log('Withdrawing sBTC from vault:', { vaultId, amount });

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    const functionArgs: ClarityValue[] = [
      stringUtf8CV(vaultId),
      uintCV(amount)
    ];

    try {
      // No post conditions needed for withdrawals (contract sends to user)
      return await this.executeContractCall('withdraw-sbtc', functionArgs, undefined);
    } catch (error) {
      console.error('Failed to withdraw sBTC:', error);
      throw new Error(`Failed to withdraw sBTC: ${error}`);
    }
  }

  async addBeneficiary(
    vaultId: string,
    beneficiaryAddress: string,
    allocationPercentage: number,
    minimumSbtcAmount: number
  ): Promise<string> {
    console.log('Adding beneficiary to vault:', {
      vaultId,
      beneficiaryAddress,
      allocationPercentage,
      minimumSbtcAmount
    });

    // Validate inputs
    if (!vaultId || !beneficiaryAddress) {
      throw new Error('Vault ID and beneficiary address are required');
    }
    
    if (allocationPercentage <= 0 || allocationPercentage > 100) {
      throw new Error('Allocation percentage must be between 1 and 100');
    }

    if (minimumSbtcAmount < 0) {
      throw new Error('Minimum sBTC amount cannot be negative');
    }

    const functionArgs: ClarityValue[] = [
      stringUtf8CV(vaultId),
      standardPrincipalCV(beneficiaryAddress),
      uintCV(allocationPercentage),
      uintCV(minimumSbtcAmount)
    ];

    try {
      return await this.executeContractCall('add-sbtc-beneficiary', functionArgs);
    } catch (error) {
      console.error('Failed to add beneficiary:', error);
      throw new Error(`Failed to add beneficiary: ${error}`);
    }
  }

  async updateProofOfLife(vaultId: string): Promise<string> {
    console.log('Updating proof of life for vault:', { vaultId });

    if (!vaultId) {
      throw new Error('Vault ID is required');
    }

    const functionArgs: ClarityValue[] = [stringUtf8CV(vaultId)];

    try {
      return await this.executeContractCall('update-proof-of-life', functionArgs);
    } catch (error) {
      console.error('Failed to update proof of life:', error);
      throw new Error(`Failed to update proof of life: ${error}`);
    }
  }

  async triggerInheritance(vaultId: string): Promise<string> {
    console.log('Triggering inheritance for vault:', { vaultId });

    if (!vaultId) {
      throw new Error('Vault ID is required');
    }

    const functionArgs: ClarityValue[] = [stringUtf8CV(vaultId)];

    try {
      return await this.executeContractCall('trigger-sbtc-inheritance', functionArgs);
    } catch (error) {
      console.error('Failed to trigger inheritance:', error);
      throw new Error(`Failed to trigger inheritance: ${error}`);
    }
  }

  async claimInheritance(vaultId: string, beneficiaryIndex: number): Promise<string> {
    console.log('Claiming inheritance:', { vaultId, beneficiaryIndex });

    if (!vaultId) {
      throw new Error('Vault ID is required');
    }

    if (beneficiaryIndex < 0) {
      throw new Error('Beneficiary index must be non-negative');
    }

    const functionArgs: ClarityValue[] = [
      stringUtf8CV(vaultId),
      uintCV(beneficiaryIndex)
    ];

    try {
      return await this.executeContractCall('claim-sbtc-inheritance', functionArgs);
    } catch (error) {
      console.error('Failed to claim inheritance:', error);
      throw new Error(`Failed to claim inheritance: ${error}`);
    }
  }

  // Read-only functions - simplified to avoid import issues
  // Get vault sBTC balance using the same working method as user balance
  async getVaultSBTCBalance(vaultId: string): Promise<number> {
    console.log('Getting vault sBTC balance for:', { vaultId });
    
    try {
      // Use the same working method as getUserMockSbtcBalance
      console.log('Using @stacks/transactions method for vault balance retrieval...');
      
      const { fetchCallReadOnlyFunction, stringUtf8CV } = await import('@stacks/transactions');
      
      console.log('Calling get-vault-sbtc-balance function...');
      
      const balanceResponse = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-vault-sbtc-balance',
        functionArgs: [stringUtf8CV(vaultId)],
        network: this.network,
        senderAddress: this.userAddress || 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX'
      });
      
      console.log('Vault balance response:', balanceResponse);
      
      if (balanceResponse && balanceResponse.type === 'uint') {
        const balance = Number(balanceResponse.value);
        console.log('Successfully retrieved vault balance:', balance);
        return balance;
      }
      
      console.log('Unexpected vault balance response format:', balanceResponse);
      return 0;
      
    } catch (error) {
      console.log('@stacks/transactions method failed for vault balance:', error);
      console.error('Full error:', error);
      return 0;
    }
  }

  async getVaultDetails(vaultId: string): Promise<any> {
    console.log('Getting vault details for:', { vaultId });
    
    try {
      // Try to get real vault data from the blockchain
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      const apiUrl = networkString === 'testnet' 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      // Query the specific vault using the contract's get-vault function
      const contractId = `${this.contractAddress}.${this.contractName}`;
      console.log('Querying vault details from contract:', contractId);
      
      // Try to get real vault data from the contract
      const vaultData = await this.callReadOnlyFunction('get-vault', [vaultId]);
      
      if (vaultData) {
        console.log('Real vault data from contract:', vaultData);
        return this.parseClarityVaultData(vaultData);
      }
      
      console.log('No vault data found in contract');
      return null;
      
    } catch (error) {
      console.error('Failed to get vault details from blockchain:', error);
      
      // No fallback data - only return real blockchain data
      console.log('No fallback data available');
      return null;
    }
  }

  async getVaultInheritanceReadiness(vaultId: string): Promise<boolean> {
    console.log('Getting vault inheritance readiness for:', { vaultId });
    
    try {
      // Try to get real data from contract
      const proofData = await this.callReadOnlyFunction('get-proof-of-life', [vaultId]);
      if (proofData) {
        const parsed = this.parseClarityVaultData(proofData);
        return parsed && parsed.status === 'active';
      }
      return false;
    } catch (error) {
      console.log('Failed to get inheritance readiness:', error);
      return false;
    }
  }

  async calculateInheritanceAmount(
    vaultId: string,
    beneficiaryIndex: number
  ): Promise<InheritanceCalculation> {
    console.log('Calculating inheritance amount for:', { vaultId, beneficiaryIndex });
    
    try {
      // Try to get real data from contract
      const calculationData = await this.callReadOnlyFunction('calculate-inheritance-amount', [vaultId, beneficiaryIndex]);
      if (calculationData) {
        const parsed = this.parseClarityVaultData(calculationData);
        return parsed || { grossAmount: 0, feeAmount: 0, netAmount: 0 };
      }
      return { grossAmount: 0, feeAmount: 0, netAmount: 0 };
    } catch (error) {
      console.log('Failed to calculate inheritance amount:', error);
      return { grossAmount: 0, feeAmount: 0, netAmount: 0 };
    }
  }

  async getProofOfLife(vaultId: string): Promise<any> {
    console.log('Getting proof of life for:', { vaultId });
    
    try {
      // Try to get real data from contract
      const proofData = await this.callReadOnlyFunction('get-proof-of-life', [vaultId]);
      if (proofData) {
        return this.parseClarityVaultData(proofData);
      }
      return null;
    } catch (error) {
      console.log('Failed to get proof of life:', error);
      return null;
    }
  }

  async getUserVaults(userAddress: string): Promise<any[]> {
    console.log('Getting user vaults for address:', { userAddress });
    
    // Set the user address for read-only function calls
    this.setUserAddress(userAddress);
    
    try {
            // Method 1: Use the working get-user-vaults function
      console.log('Using get-user-vaults function...');
      try {
        const userVaultsResponse = await this.callReadOnlyFunction('get-user-vaults', [userAddress]);
        console.log('get-user-vaults response:', userVaultsResponse);
        
        if (userVaultsResponse && userVaultsResponse.type === 'list' && userVaultsResponse.value) {
          const vaultIds = userVaultsResponse.value;
          console.log('Found vault IDs:', vaultIds);
          
          // Extract string values from Clarity response
          const extractedVaultIds = vaultIds.map((vaultId: any) => {
            if (typeof vaultId === 'string') {
              return vaultId;
            } else if (vaultId && typeof vaultId === 'object' && vaultId.type === 'utf8') {
              return vaultId.value;
            } else {
              console.log('Unknown vaultId format:', vaultId);
              return String(vaultId);
            }
          });
          
          console.log('Extracted vault IDs:', extractedVaultIds);
          
          // Query each vault to get full data
          const vaults = [];
          for (const vaultId of extractedVaultIds) {
            try {
              console.log('Querying vault:', vaultId);
              const vaultData = await this.callReadOnlyFunction('get-vault', [vaultId]);
              console.log('Vault data response:', vaultData);
              
              if (vaultData) {
                // Handle both Hiro API format and direct Clarity format
                const vaultResult = vaultData.result || vaultData;
                const parsedVault = this.parseClarityVaultData(vaultResult);
                console.log('Parsed vault:', parsedVault);
                
                if (parsedVault) {
                  vaults.push({
                    ...parsedVault,
                    vaultId,
                    source: 'get-user-vaults-function'
                  });
                }
              }
            } catch (vaultError) {
              console.log(`Failed to query vault ${vaultId}:`, vaultError);
            }
          }
          
          if (vaults.length > 0) {
            console.log('Returning vaults from get-user-vaults:', vaults);
            return vaults;
          }
        }
      } catch (userVaultsError) {
        console.log('get-user-vaults failed, falling back to known vault ID:', userVaultsError);
      }
      
      // Fallback: Use the known vault ID that we know exists
      console.log('Using known vault ID fallback...');
      
      const knownVaultId = 'vault-1756388148258-GY15HX';
      console.log('Querying known vault:', knownVaultId);
      
      try {
        const vaultData = await this.callReadOnlyFunction('get-vault', [knownVaultId]);
        console.log('Vault data response:', vaultData);
        
        if (vaultData) {
          // Handle both Hiro API format and direct Clarity format
          const vaultResult = vaultData.result || vaultData;
          const parsedVault = this.parseClarityVaultData(vaultResult);
          console.log('Parsed vault:', parsedVault);
          
          if (parsedVault) {
            const vaults = [{
              ...parsedVault,
              vaultId: knownVaultId,
              source: 'known-vault-query'
            }];
            console.log('Returning vaults from fallback:', vaults);
            return vaults;
          }
        }
      } catch (vaultError) {
        console.log('Failed to query known vault:', vaultError);
      }
      
      console.log('No vaults found for user');
      return [];
      
    } catch (error) {
      console.error('Error getting user vaults:', error);
      return [];
    }
  }

  // Parse Clarity vault data into JavaScript objects
  private parseClarityVaults(clarityData: any): any[] {
    try {
      console.log('Parsing Clarity data:', clarityData);
      
      // Handle the (some ...) wrapper
      if (clarityData.type === 'some' && clarityData.value) {
        const vaultData = clarityData.value;
        
        // Parse the tuple data
        if (vaultData.type === 'tuple') {
          const vault = this.parseClarityTuple(vaultData.data);
          console.log('Parsed vault tuple:', vault);
          return [vault];
        }
      }
      
      // Handle direct tuple data
      if (clarityData.type === 'tuple') {
        const vault = this.parseClarityTuple(clarityData.data);
        return [vault];
      }
      
      console.log('Unknown Clarity data format:', clarityData);
      return [];
      
    } catch (error) {
      console.error('Error parsing Clarity data:', error);
      return [];
    }
  }

  // Parse Clarity vault IDs from a list
  private parseClarityVaultIds(clarityData: any): string[] {
    try {
      console.log('Parsing Clarity vault IDs:', clarityData);
      
      if (!clarityData || !clarityData.value) {
        console.log('No vault data to parse');
        return [];
      }
      
      const vaultData = clarityData.value;
      console.log('Vault data to parse:', vaultData);
      
      if (vaultData.type === 'list') {
        const listItems = vaultData.value || [];
        console.log('List items:', listItems);
        
        return listItems.map((item: any) => {
          if (item.type === 'utf8') {
            return item.value;
          }
          return null;
        }).filter(Boolean);
      }
      
      console.log('Unexpected data format for vault IDs');
      return [];
    } catch (error) {
      console.log('Error parsing Clarity vault IDs:', error);
      return [];
    }
  }

  // Parse individual Clarity tuple fields
  private parseClarityTuple(tupleData: any): any {
    const vault: any = {};
    
    console.log('Parsing Clarity tuple:', tupleData);
    
    // Check if tupleData is valid
    if (!tupleData || typeof tupleData !== 'object') {
      console.error('Invalid tuple data:', tupleData);
      return null;
    }
    
    // Map Clarity field names to JavaScript properties
    const fieldMappings: { [key: string]: string } = {
      'vault-name': 'name',
      'sbtc-balance': 'sbtcBalance',
      'sbtc-locked': 'sbtcLocked',
      'inheritance-delay': 'inheritanceDelay',
      'privacy-level': 'privacyLevel',
      'grace-period': 'gracePeriod',
      'minimum-inheritance': 'minimumInheritance',
      'auto-distribute': 'autoDistribute',
      'created-at': 'createdAt',
      'last-activity': 'lastActivity',
      'status': 'status',
      'owner': 'owner',
      'emergency-contacts': 'emergencyContacts',
      'legal-document-hash': 'legalDocumentHash',
      'bitcoin-addresses-hash': 'bitcoinAddressesHash',
      'beneficiaries-hash': 'beneficiariesHash'
    };
    
    for (const [clarityKey, value] of Object.entries(tupleData)) {
      const jsKey = fieldMappings[clarityKey] || clarityKey;
      
      if (value && typeof value === 'object' && 'value' in value) {
        // Extract the actual value from Clarity wrapper
        vault[jsKey] = this.extractClarityValue(value);
      } else {
        vault[jsKey] = value;
      }
    }
    
    // Generate a vault ID if not present
    vault.vaultId = vault.name ? `vault-${Date.now()}-${vault.name}` : `vault-${Date.now()}`;
    
    // Add default values for missing fields
    vault.sbtcBalance = vault.sbtcBalance || 0;
    vault.status = vault.status || 'active';
    vault.createdAt = vault.createdAt || new Date().toISOString();
    vault.lastActivity = vault.lastActivity || new Date().toISOString();
    
    console.log('Parsed vault object:', vault);
    return vault;
  }

  // Extract values from Clarity value wrappers
  private extractClarityValue(clarityValue: any): any {
    if (!clarityValue || typeof clarityValue !== 'object') {
      return clarityValue;
    }
    
    console.log('Extracting Clarity value:', clarityValue);
    
    switch (clarityValue.type) {
      case 'uint':
        return Number(clarityValue.value);
      case 'int':
        return Number(clarityValue.value);
      case 'bool':
        return clarityValue.value === 'true';
      case 'string-ascii':
      case 'string-utf8':
        return String(clarityValue.value);
      case 'principal':
        return String(clarityValue.value);
      case 'address':
        return String(clarityValue.value);
      case 'buffer':
        return String(clarityValue.value);
      case 'list':
        return Array.isArray(clarityValue.value) ? clarityValue.value.map((v: any) => this.extractClarityValue(v)) : [];
      default:
        console.log('Unknown Clarity type:', clarityValue.type, 'value:', clarityValue.value);
        return clarityValue.value;
    }
  }

  // Utility function to estimate transaction fees
  async estimateTransactionFee(functionName: string, functionArgs: ClarityValue[]): Promise<number> {
    try {
      // This is a placeholder - in a real implementation, you'd use the Stacks API
      // to estimate fees based on network conditions
      return 10000; // Default fee in microSTX
    } catch (error) {
      console.error('Failed to estimate transaction fee:', error);
      return 10000; // Fallback fee
    }
  }

  // Query contract state to get real vault data using get-vault function
  async queryContractState(vaultId: string): Promise<any> {
    try {
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      const apiUrl = networkString === 'testnet' 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      const contractId = `${this.contractAddress}.${this.contractName}`;
      
      console.log('Querying vault using get-vault function:', { vaultId, contractId });
      
      // Method 1: Try to call the get-vault function directly using our helper
      try {
        const functionData = await this.callReadOnlyFunction('get-vault', [vaultId]);
        if (functionData) {
          console.log('get-vault function response for vault:', functionData);
          
          // Parse the Clarity response
          return this.parseClarityVaultData(functionData);
        }
      } catch (functionError) {
        console.log('get-vault function call failed:', functionError);
      }
      
      // Method 2: Try to get the vault data from the contract's map
      try {
        const mapName = 'vaults';
        const mapResponse = await fetch(
          `${apiUrl}/extended/v1/contract/${contractId}/map/${mapName}/${vaultId}`
        );
        
        if (mapResponse.ok) {
          const mapData = await mapResponse.json();
          console.log('Contract map data for vault:', mapData);
          return this.parseClarityVaultData(mapData);
        }
      } catch (mapError) {
        console.log('Map query failed:', mapError);
      }
      
      // Method 3: Try to get vault data from contract state
      try {
        const contractResponse = await fetch(`${apiUrl}/extended/v1/contract/${contractId}`);
        const contractData = await contractResponse.json();
        
        if (contractData && contractData.source_code) {
          console.log('Contract source available, looking for vault data...');
          // TODO: Parse contract source to find vault data
        }
      } catch (contractError) {
        console.log('Contract state query failed:', contractError);
      }
      
      console.log('All query methods failed for vault:', vaultId);
      return null;
      
    } catch (error) {
      console.error('Failed to query contract state:', error);
      return null;
    }
  }

  // Get all vaults from contract state
  async getAllVaultsFromContract(): Promise<any[]> {
    try {
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      const apiUrl = networkString === 'testnet' 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      const contractId = `${this.contractAddress}.${this.contractName}`;
      
      console.log('Querying all vaults from contract state:', contractId);
      
      // Try to get the contract's data maps
      const contractResponse = await fetch(`${apiUrl}/extended/v1/contract/${contractId}`);
      const contractData = await contractResponse.json();
      
      console.log('Contract data response:', contractData);
      
      // Look for vault-related data in the contract
      if (contractData && contractData.source_code) {
        console.log('Contract source code available, analyzing structure...');
        
        // Try to get vaults from the inheritance-vaults map
        try {
          const vaultsMapResponse = await fetch(
            `${apiUrl}/extended/v1/contract/${contractId}/map/inheritance-vaults`
          );
          
          if (vaultsMapResponse.ok) {
            const vaultsMapData = await vaultsMapResponse.json();
            console.log('Vaults map data:', vaultsMapData);
            
            // Parse the map data to extract vaults
            return this.parseVaultsMapData(vaultsMapData);
          }
        } catch (mapError) {
          console.log('Failed to get vaults map:', mapError);
        }
      }
      
      return [];
      
    } catch (error) {
      console.error('Failed to get all vaults from contract:', error);
      return [];
    }
  }

  // Parse vaults map data from contract
  private parseVaultsMapData(mapData: any): any[] {
    try {
      console.log('Parsing vaults map data:', mapData);
      
      const vaults: any[] = [];
      
      // Handle different map data formats
      if (mapData.data && Array.isArray(mapData.data)) {
        for (const entry of mapData.data) {
          if (entry.key && entry.value) {
            const vaultId = this.extractClarityValue(entry.key);
            const vaultData = this.parseClarityVaultData(entry.value);
            
            if (vaultId && vaultData) {
              vaults.push({
                ...vaultData,
                vaultId,
                source: 'contract-map'
              });
            }
          }
        }
      }
      
      console.log('Parsed vaults from map:', vaults);
      return vaults;
      
    } catch (error) {
      console.error('Error parsing vaults map data:', error);
      return [];
    }
  }

  // Generate a proper vault ID in the correct format
  generateVaultId(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `vault-${timestamp}-${randomSuffix}`;
  }

  // Get vaults by owner principal using contract queries
  async getVaultsByOwner(ownerAddress: string): Promise<any[]> {
    try {
      console.log('Getting vaults for owner:', ownerAddress);
      
      // Method 1: Query the entire inheritance-vaults map and filter by owner
      console.log('Querying inheritance-vaults map to find user vaults...');
      const userVaults = await this.getUserVaultsFromMap(ownerAddress);
      
      if (userVaults && userVaults.length > 0) {
        console.log(`Found ${userVaults.length} vaults for owner from map:`, userVaults);
        return userVaults;
      }
      
      // Method 2: Fallback to session vaults
      console.log('No vaults found in map, checking session vaults...');
      const sessionVaults = Array.from(this.createdVaults.keys());
      console.log('Session vaults to query:', sessionVaults);
      
      const foundVaults = [];
      for (const sessionVaultId of sessionVaults) {
        try {
          const vaultData = await this.callReadOnlyFunction('get-vault', [sessionVaultId]);
          
          if (vaultData) {
            console.log(`Session vault ${sessionVaultId} data:`, vaultData);
            
            const parsedVault = this.parseClarityVaultData(vaultData);
            
            if (parsedVault && parsedVault.owner === ownerAddress) {
              foundVaults.push({
                ...parsedVault,
                vaultId: sessionVaultId,
                source: 'session-query'
              });
            }
          }
        } catch (vaultError) {
          console.log(`Failed to query session vault ${sessionVaultId}:`, vaultError);
        }
      }
      
      if (foundVaults.length > 0) {
        console.log(`Found ${foundVaults.length} vaults for owner from session:`, foundVaults);
        return foundVaults;
      }
      
      console.log('No vaults found for owner');
      return [];
      
    } catch (error) {
      console.error('Failed to get vaults by owner:', error);
      return [];
    }
  }

  // Get user vaults directly from the inheritance-vaults map
  async getUserVaultsFromMap(ownerAddress: string): Promise<any[]> {
    try {
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      const apiUrl = networkString === 'testnet' 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      const contractId = `${this.contractAddress}.${this.contractName}`;
      
      console.log('Querying inheritance-vaults map for user vaults:', { contractId, ownerAddress });
      
      // Method 1: Try the inheritance-vaults map
      try {
        const mapResponse = await fetch(
          `${apiUrl}/extended/v1/contract/${contractId}/map/inheritance-vaults`
        );
        
        if (mapResponse.ok) {
          const mapData = await mapResponse.json();
          console.log('Inheritance-vaults map data:', mapData);
          
          // Parse the map data and filter by owner
          return this.parseUserVaultsFromMap(mapData, ownerAddress);
        } else {
          console.log('inheritance-vaults map not found, trying alternative maps...');
        }
      } catch (mapError) {
        console.log('Failed to query inheritance-vaults map:', mapError);
      }
      
      // Method 2: Try alternative map names
      const alternativeMapNames = ['vaults', 'vault', 'inheritance-vault', 'vault-data'];
      
      for (const mapName of alternativeMapNames) {
        try {
          console.log(`Trying alternative map: ${mapName}`);
          const altMapResponse = await fetch(
            `${apiUrl}/extended/v1/contract/${contractId}/map/${mapName}`
          );
          
          if (altMapResponse.ok) {
            const mapData = await altMapResponse.json();
            console.log(`${mapName} map data:`, mapData);
            
            // Parse the map data and filter by owner
            return this.parseUserVaultsFromMap(mapData, ownerAddress);
          }
        } catch (altMapError) {
          console.log(`Failed to query ${mapName} map:`, altMapError);
        }
      }
      
      // Method 3: Get contract data to see what maps exist
      try {
        console.log('Getting contract data to analyze available maps...');
        const contractResponse = await fetch(`${apiUrl}/extended/v1/contract/${contractId}`);
        
        if (contractResponse.ok) {
          const contractData = await contractResponse.json();
          console.log('Contract data:', contractData);
          
          // Look for map information in the contract data
          if (contractData.abi) {
            try {
              const abi = JSON.parse(contractData.abi);
              if (abi.maps) {
                console.log('Available maps in contract:', abi.maps.map((m: any) => m.name));
              }
            } catch (abiError) {
              console.log('Failed to parse contract ABI:', abiError);
            }
          }
        }
      } catch (contractError) {
        console.log('Failed to get contract data:', contractError);
      }
      
      console.log('No maps found, returning empty array');
      return [];
      
    } catch (error) {
      console.error('Failed to get user vaults from map:', error);
      return [];
    }
  }

  // Parse user vaults from the inheritance-vaults map
  private parseUserVaultsFromMap(mapData: any, ownerAddress: string): any[] {
    try {
      console.log('Parsing user vaults from map data:', mapData);
      
      const userVaults: any[] = [];
      
      // Handle different map data formats
      if (mapData.data && Array.isArray(mapData.data)) {
        for (const entry of mapData.data) {
          if (entry.key && entry.value) {
            try {
              // Extract vault ID from the key
              const vaultId = this.extractClarityValue(entry.key);
              console.log('Processing vault entry:', { vaultId, entry });
              
              // Parse the vault data
              const vaultData = this.parseClarityVaultData(entry.value);
              
              if (vaultData && vaultData.owner === ownerAddress) {
                console.log(`Found vault ${vaultId} belonging to ${ownerAddress}:`, vaultData);
                userVaults.push({
                  ...vaultData,
                  vaultId,
                  source: 'map-query'
                });
              }
            } catch (entryError) {
              console.log('Failed to process map entry:', entryError);
            }
          }
        }
      }
      
      console.log(`Parsed ${userVaults.length} user vaults from map`);
      return userVaults;
      
    } catch (error) {
      console.error('Error parsing user vaults from map:', error);
      return [];
    }
  }

  // Discover vaults by trying common naming patterns
  private async discoverVaultsByPattern(totalVaults: number, ownerAddress: string): Promise<any[]> {
    try {
      console.log(`Attempting to discover ${totalVaults} vaults using common patterns...`);
      
      const discoveredVaults: any[] = [];
      
      // Try different vault ID patterns
      const patterns = [
        // Pattern 1: vault-{timestamp}-{suffix}
        () => {
          const timestamp = Date.now();
          const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
          return `vault-${timestamp}-${suffix}`;
        },
        // Pattern 2: vault-{index}
        (index: number) => `vault-${index}`,
        // Pattern 3: vault-{timestamp}
        () => `vault-${Date.now()}`,
        // Pattern 4: vault-{random}
        () => `vault-${Math.random().toString(36).substring(2, 10)}`
      ];
      
      // Try each pattern with multiple attempts
      for (let attempt = 0; attempt < 10; attempt++) {
        for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
          const pattern = patterns[patternIndex];
          const vaultId = pattern(attempt);
          
          try {
            console.log(`Trying pattern ${patternIndex + 1}, attempt ${attempt + 1}: ${vaultId}`);
            const vaultData = await this.callReadOnlyFunction('get-vault', [vaultId]);
            
            if (vaultData) {
              console.log(`Found vault ${vaultId}:`, vaultData);
              const parsedVault = this.parseClarityVaultData(vaultData);
              
              if (parsedVault && parsedVault.owner === ownerAddress) {
                // Check if we already found this vault
                const existingVault = discoveredVaults.find(v => v.vaultId === vaultId);
                if (!existingVault) {
                  discoveredVaults.push({
                    ...parsedVault,
                    vaultId,
                    source: `pattern-discovery-${patternIndex + 1}`
                  });
                  console.log(`Discovered new vault: ${vaultId}`);
                }
              }
            }
          } catch (vaultError) {
            // Silently continue to next pattern
          }
          
          // If we found enough vaults, stop searching
          if (discoveredVaults.length >= totalVaults) {
            console.log(`Found ${discoveredVaults.length} vaults, stopping search`);
            return discoveredVaults;
          }
        }
      }
      
      console.log(`Discovery complete. Found ${discoveredVaults.length} vaults`);
      return discoveredVaults;
      
    } catch (error) {
      console.error('Error discovering vaults by pattern:', error);
      return [];
    }
  }

  // Call read-only function on the contract
  async callReadOnlyFunction(functionName: string, functionArgs: any[] = []): Promise<any> {
    try {
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      const apiUrl = networkString === 'testnet' 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      const contractId = `${this.contractAddress}.${this.contractName}`;
      
      console.log('🔍 DEBUG: callReadOnlyFunction called with:', { 
        functionName, 
        functionArgs, 
        contractId,
        userAddress: this.userAddress,
        network: networkString
      });
      
      // Method 1: Try the Stacks API's read-only function endpoint
      try {
        console.log('🔍 DEBUG: Trying Hiro API method...');
        // Format arguments properly for the API
        const formattedArgs = functionArgs.map((arg, index) => {
          if (typeof arg === 'string') {
            // Check if this looks like a Stacks address (starts with ST or SP)
            if (arg.startsWith('ST') || arg.startsWith('SP')) {
              return {
                type: 'principal',
                value: arg
              };
            }
            return {
              type: 'string-utf8',
              value: arg
            };
          } else if (typeof arg === 'number') {
            return {
              type: 'uint',
              value: arg.toString()
            };
          } else if (typeof arg === 'boolean') {
            return {
              type: 'bool',
              value: arg.toString()
            };
          }
          return arg;
        });
        
        console.log('🔍 DEBUG: Formatted args for Hiro API:', formattedArgs);
        
        const response = await fetch(
          `${apiUrl}/extended/v1/contract/${contractId}/call-read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              function_name: functionName,
              function_args: formattedArgs,
              sender: this.userAddress || this.contractAddress // Use user address if available
            })
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔍 DEBUG: Hiro API success:', data);
          return data;
        } else {
          console.log('🔍 DEBUG: Hiro API failed with status:', response.status);
          const errorText = await response.text();
          console.log('🔍 DEBUG: Hiro API error response:', errorText);
        }
      } catch (apiError) {
        console.log('🔍 DEBUG: Hiro API method failed:', apiError);
      }
      
      // Method 2: Try using @stacks/transactions for read-only calls
      try {
        console.log('🔍 DEBUG: Trying @stacks/transactions method...');
        const { fetchCallReadOnlyFunction, stringUtf8CV } = await import('@stacks/transactions');
        
        // Convert function arguments to proper Clarity values
        const convertedArgs = functionArgs.map((arg, index) => {
          if (typeof arg === 'string') {
            // Check if this looks like a Stacks address (starts with ST or SP)
            if (arg.startsWith('ST') || arg.startsWith('SP')) {
              return standardPrincipalCV(arg);
            }
            // Convert string arguments to stringUtf8CV
            return stringUtf8CV(arg);
          }
          return arg;
        });
        
        console.log('🔍 DEBUG: Converted function args:', convertedArgs);
        console.log('🔍 DEBUG: About to call fetchCallReadOnlyFunction with:', {
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: functionName,
          functionArgs: convertedArgs,
          network: this.network,
          senderAddress: this.userAddress || this.contractAddress
        });
        
        const result = await fetchCallReadOnlyFunction({
          contractAddress: this.contractAddress,
          contractName: this.contractName,
          functionName: functionName,
          functionArgs: convertedArgs,
          network: this.network,
          senderAddress: this.userAddress || this.contractAddress // Use user address if available
        });
        
        console.log('🔍 DEBUG: @stacks/transactions success:', result);
        return result;
        
      } catch (stacksError) {
        console.log('🔍 DEBUG: @stacks/transactions method failed:', stacksError);
      }
      
      console.log('🔍 DEBUG: All read-only function methods failed');
      return null;
      
    } catch (error) {
      console.error('🔍 DEBUG: callReadOnlyFunction completely failed:', error);
      return null;
    }
  }

  // Parse Clarity vault data from contract response
  private parseClarityVaultData(clarityData: any): any {
    try {
      console.log('Parsing Clarity vault data:', clarityData);
      
      // Handle different response formats from read-only functions
      let dataToParse = clarityData;
      
      // If it's a successful read-only function response
      if (clarityData.result) {
        dataToParse = clarityData.result;
      }
      
      // Handle the (some ...) wrapper from your Clarity response
      if (dataToParse.type === 'some' && dataToParse.value) {
        const vaultData = dataToParse.value;
        console.log('Found some wrapper, vault data:', vaultData);
        
        // Parse the tuple data
        if (vaultData.type === 'tuple') {
          console.log('Found tuple, data:', vaultData.value);
          return this.parseClarityTuple(vaultData.value);
        }
      }
      
      // Handle direct tuple data
      if (dataToParse.type === 'tuple') {
        console.log('Found direct tuple, data:', dataToParse.value);
        return this.parseClarityTuple(dataToParse.value);
      }
      
      // Handle response data from @stacks/transactions
      if (dataToParse.type === 'response' && dataToParse.value) {
        if (dataToParse.value.type === 'ok') {
          return this.parseClarityVaultData(dataToParse.value.value);
        } else {
          console.log('Contract returned error response:', dataToParse.value.value);
          return null;
        }
      }
      
      console.log('Unknown Clarity data format:', dataToParse);
      return null;
      
    } catch (error) {
      console.error('Error parsing Clarity vault data:', error);
      return null;
    }
  }

  // Get user's mock sBTC balance
  async getUserMockSbtcBalance(userAddress: string): Promise<number> {
    try {
      console.log('Getting user mock sBTC balance for:', userAddress);
      console.log('Using contract:', `${this.contractAddress}.${this.sbtcTokenName}`);
      
      // Use the working method from the backend tests (same as test-balance-simple.js)
      try {
        console.log('Using @stacks/transactions method for balance retrieval...');
        
        // Import the working function from @stacks/transactions
        const { fetchCallReadOnlyFunction, standardPrincipalCV } = await import('@stacks/transactions');
        
        console.log('Calling get-balance function...');
        
        const balanceResponse = await fetchCallReadOnlyFunction({
          contractAddress: this.contractAddress,
          contractName: this.sbtcTokenName,
          functionName: 'get-balance',
          functionArgs: [standardPrincipalCV(userAddress)],
          network: this.network,
          senderAddress: userAddress
        });
        
        console.log('Balance response:', balanceResponse);
        
        if (balanceResponse && balanceResponse.type === 'uint') {
          const balance = Number(balanceResponse.value);
          console.log('Successfully retrieved balance:', balance);
          return balance;
        } else if (balanceResponse && typeof balanceResponse === 'object' && 'type' in balanceResponse) {
          // Handle response wrapper - cast to any to handle different response types
          const responseValue = (balanceResponse as any);
          if (responseValue.value && responseValue.value.type === 'ok' && responseValue.value.value) {
            const balance = Number(responseValue.value.value.value);
            console.log('Successfully retrieved balance from response wrapper:', balance);
            return balance;
          } else if (responseValue.value) {
            console.log('Contract returned error:', responseValue.value);
          }
        }
        
        console.log('Unexpected balance response format:', balanceResponse);
        return 0;
        
      } catch (stacksError) {
        console.log('@stacks/transactions method failed:', stacksError);
        console.error('Full error:', stacksError);
        return 0;
      }
      
    } catch (error) {
      console.error('Failed to get user mock sBTC balance:', error);
      return 0;
    }
  }

  // Check wallet connection status
  checkWalletConnection(): { connected: boolean; walletType: string; network: string } {
    if (typeof window === 'undefined') {
      return { connected: false, walletType: 'none', network: 'none' };
    }

    const wallet = (window as any);
    let walletType = 'none';
    let connected = false;

    if (wallet.StacksProvider) {
      walletType = 'Stacks Connect (Hiro)';
      connected = true;
    } else if (wallet.stacks) {
      walletType = 'Legacy Stacks';
      connected = true;
    } else if (wallet.XverseProvider) {
      walletType = 'Xverse';
      connected = true;
    } else if (wallet.request) {
      walletType = 'Direct Request';
      connected = true;
    }

    return {
      connected,
      walletType,
      network: this.network === STACKS_MAINNET ? 'mainnet' : 'testnet'
    };
  }

  // Mint mock sBTC tokens to user
  async mintMockSBTC(userAddress: string, amount: number): Promise<string> {
    try {
      console.log('Minting mock sBTC tokens:', { userAddress, amount });
      console.log('Contract details:', {
        contractAddress: this.contractAddress,
        sbtcTokenName: this.sbtcTokenName,
        fullContract: `${this.contractAddress}.${this.sbtcTokenName}`,
        network: this.network === STACKS_MAINNET ? 'mainnet' : 'testnet'
      });
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Cannot mint tokens outside of browser environment');
      }
      
      // Use the same request method that works for vault creation
      console.log('Using new Stacks Connect request API for minting...');
      
      // Convert network to string format expected by request method
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      
      // Prepare contract identifier
      const contract = `${this.contractAddress}.${this.sbtcTokenName}` as const;
      
      console.log('Mint request parameters:', {
        method: 'stx_callContract',
        contract,
        functionName: 'mint',
        functionArgsCount: 2,
        network: networkString
      });

      // Use the new request method for minting (same as vault creation)
      const response = await request('stx_callContract', {
        contract,
        functionName: 'mint',
        functionArgs: [
          uintCV(amount),
          standardPrincipalCV(userAddress)
        ],
        network: networkString
      });

      console.log('Mint successful:', response);
      return response.txid || 'transaction-submitted';
      
    } catch (error) {
      console.error('Failed to mint mock sBTC:', error);
      throw new Error(`Failed to mint mock sBTC: ${error}`);
    }
  }

  // Get real transaction history for a vault
  async getVaultTransactions(vaultId: string): Promise<any[]> {
    try {
      console.log('Fetching real transaction history for vault:', vaultId);
      
      // Get recent blocks to search for events
      const networkString = this.network === STACKS_MAINNET ? 'mainnet' : 'testnet';
      const apiUrl = networkString === 'testnet' 
        ? 'https://api.testnet.hiro.so' 
        : 'https://api.hiro.so';
      
      // Search for contract events related to this vault
      const response = await fetch(
        `${apiUrl}/extended/v1/address/${this.contractAddress}/transactions?limit=50`
      );
      
      if (response.ok) {
        const transactions = await response.json();
        console.log('Found transactions:', transactions);
        
        // Filter transactions that involve this vault
        const vaultTransactions = transactions.results.filter((tx: any) => {
          // Look for transactions that mention this vault ID
          const contractCall = tx.contract_call;
          if (contractCall && contractCall.contract_id === `${this.contractAddress}.${this.contractName}`) {
            // Check if the function call involves this vault
            const functionArgs = contractCall.function_args || [];
            return functionArgs.some((arg: any) => 
              arg.name === 'vault-id' && arg.value.includes(vaultId)
            );
          }
          return false;
        });
        
        console.log('Vault-specific transactions:', vaultTransactions);
        
        // Convert to our transaction format
        const formattedTransactions = vaultTransactions.map((tx: any, index: number) => ({
          id: `tx-${tx.tx_id}-${index}`,
          vaultId: vaultId,
          type: this.determineTransactionType(tx),
          amount: this.extractTransactionAmount(tx),
          from: tx.sender_address,
          to: this.contractAddress,
          status: tx.tx_status === 'success' ? 'confirmed' : 'pending',
          timestamp: new Date(tx.burn_block_time * 1000),
          blockHeight: tx.burn_block_height,
          txHash: tx.tx_id
        }));
        
        return formattedTransactions;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch vault transactions:', error);
      return [];
    }
  }
  
  // Determine transaction type based on function called
  private determineTransactionType(transaction: any): string {
    const functionName = transaction.contract_call?.function_name;
    
    switch (functionName) {
      case 'deposit-sbtc':
        return 'deposit';
      case 'withdraw-sbtc':
        return 'withdrawal';
      case 'trigger-sbtc-inheritance':
        return 'inheritance-triggered';
      case 'claim-sbtc-inheritance':
        return 'inheritance-payout';
      default:
        return 'unknown';
    }
  }
  
  // Extract transaction amount from function arguments
  private extractTransactionAmount(transaction: any): number {
    const functionArgs = transaction.contract_call?.function_args || [];
    const amountArg = functionArgs.find((arg: any) => arg.name === 'amount');
    
    if (amountArg && amountArg.value) {
      return parseInt(amountArg.value) || 0;
    }
    
    return 0;
  }

  // Get network info
  getNetworkInfo() {
    const networkConfig = NETWORKS[DEFAULT_NETWORK];
    return {
      network: this.network,
      networkName: networkConfig.name,
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      sbtcTokenAddress: this.sbtcTokenAddress,
      sbtcTokenName: this.sbtcTokenName,
      stacksApiUrl: networkConfig.stacksApiUrl,
      explorerUrl: networkConfig.explorerUrl
    };
  }
}

export const sbtcStacksService = new SBTCStacksService();