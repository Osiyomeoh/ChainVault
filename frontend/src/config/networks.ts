export interface NetworkConfig {
  name: string;
  contractAddress: string;
  sbtcTokenAddress: string;
  stacksApiUrl: string;
  explorerUrl: string;
  chainvaultContract: string;
  mockSbtcContract: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    name: 'Testnet',
    contractAddress: 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX',
    sbtcTokenAddress: 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX',
    stacksApiUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    chainvaultContract: 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.chainvault-core-v6',
    mockSbtcContract: 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2'
  },
  mainnet: {
    name: 'Mainnet',
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Placeholder
    sbtcTokenAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Placeholder
    stacksApiUrl: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    chainvaultContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.chainvault-core-v6', // Placeholder
    mockSbtcContract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.mock-sbtc-token-v2' // Placeholder
  }
};

export const DEFAULT_NETWORK = 'testnet';
