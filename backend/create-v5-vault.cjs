const { fetchCallReadOnlyFunction, stringUtf8CV, uintCV, standardPrincipalCV, bufferCV, boolCV } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

// Configuration - Using the NEW deployed contract
const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v5';
const MOCK_SBTC_CONTRACT = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

async function createV5Vault() {
  try {
    console.log('🏗️  Creating New Vault in chainvault-core-v5');
    console.log('============================================');
    console.log('');
    
    console.log('📋 Configuration:');
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log('User:', USER_ADDRESS);
    console.log('');
    
    // 1. Check user sBTC balance
    console.log('1. Checking user sBTC balance...');
    const balanceResponse = await fetchCallReadOnlyFunction({
      contractAddress: MOCK_SBTC_CONTRACT.split('.')[0],
      contractName: MOCK_SBTC_CONTRACT.split('.')[1],
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(USER_ADDRESS)],
      network: NETWORK,
      senderAddress: USER_ADDRESS
    });
    
    const userBalance = Number(balanceResponse.value);
    console.log('✅ User sBTC Balance:', userBalance / 100000000, 'sBTC');
    console.log('');
    
    // 2. Generate new vault ID
    const newVaultId = `vault-${Date.now()}-${USER_ADDRESS.split('').slice(-6).join('')}`;
    console.log('2. Generated new vault ID:', newVaultId);
    console.log('');
    
    // 3. Show vault creation parameters
    console.log('3. Vault Creation Parameters:');
    console.log('Vault ID:', newVaultId);
    console.log('Vault Name: "Test Vault v5"');
    console.log('Inheritance Delay: 144 blocks');
    console.log('Privacy Level: 2 (Medium)');
    console.log('Grace Period: 72 blocks');
    console.log('Initial sBTC: 0.1 sBTC (10,000,000 sats)');
    console.log('Lock sBTC: false');
    console.log('Auto Distribute: true');
    console.log('');
    
    // 4. Show what the create-sbtc-vault call would look like
    console.log('4. Create Vault Function Call:');
    console.log('Function: create-sbtc-vault');
    console.log('Arguments:');
    console.log(`  - vault-id: "${newVaultId}"`);
    console.log(`  - vault-name: "Test Vault v5"`);
    console.log(`  - inheritance-delay: 144`);
    console.log(`  - privacy-level: 2`);
    console.log(`  - grace-period: 72`);
    console.log(`  - initial-sbtc-amount: 10000000`);
    console.log(`  - lock-sbtc: false`);
    console.log(`  - auto-distribute: true`);
    console.log('');
    
    console.log('📝 Next Steps:');
    console.log('1. Use the frontend to create this vault');
    console.log('2. Or execute the create-sbtc-vault transaction');
    console.log('3. Then test depositing additional sBTC');
    console.log('');
    console.log('🎯 Ready to create vault in v5 contract!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

createV5Vault();
