const { fetchCallReadOnlyFunction, stringUtf8CV, uintCV, standardPrincipalCV } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

// Configuration
const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v6';
const MOCK_SBTC_CONTRACT = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2';

// Test parameters
const TEST_VAULT_ID = 'vault-1756489905982-GY15HX';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const DEPOSIT_AMOUNT = 10000000; // 0.1 sBTC in sats

async function testContractBug() {
  try {
    console.log('🔍 Testing Contract Logic Bug in deposit-sbtc');
    console.log('============================================');
    console.log('');
    
    console.log('📋 Configuration:');
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log('Vault ID:', TEST_VAULT_ID);
    console.log('User:', USER_ADDRESS);
    console.log('Deposit Amount:', DEPOSIT_AMOUNT, 'sats (', DEPOSIT_AMOUNT / 100000000, 'sBTC)');
    console.log('');
    
    // Step 1: Check user balance
    console.log('1. Checking user sBTC balance...');
    try {
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
      
      if (userBalance < DEPOSIT_AMOUNT) {
        console.log('❌ Insufficient balance for deposit');
        return;
      }
    } catch (error) {
      console.log('❌ Failed to check balance:', error.message);
      return;
    }
    console.log('');
    
    // Step 2: Check vault status
    console.log('2. Checking vault status...');
    try {
      const vaultResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(TEST_VAULT_ID)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      if (vaultResponse.type === 'some') {
        const vault = vaultResponse.value;
        if (vault && vault.type === 'tuple' && vault.value) {
          const vaultData = vault.value;
          const owner = vaultData.owner?.value || 'Unknown';
          const status = vaultData.status?.value || 'Unknown';
          const sbtcBalance = vaultData['sbtc-balance']?.value || 0;
          
          console.log('✅ Vault found:');
          console.log('   Owner:', owner);
          console.log('   Status:', status);
          console.log('   Current sBTC Balance:', Number(sbtcBalance) / 100000000, 'sBTC');
          
          if (owner !== USER_ADDRESS) {
            console.log('❌ User does not own this vault');
            return;
          }
          
          if (status !== 'active') {
            console.log('❌ Vault is not active');
            return;
          }
        }
      } else {
        console.log('❌ Vault not found');
        return;
      }
    } catch (error) {
      console.log('❌ Failed to check vault:', error.message);
      return;
    }
    console.log('');
    
    // Step 3: Test the contract logic issue
    console.log('3. Testing contract logic issue...');
    console.log('🔍 The Problem:');
    console.log('   When chainvault-core-v6 calls mock-sbtc-token-v2.transfer:');
    console.log('   - tx-sender = contract address (chainvault-core-v6)');
    console.log('   - sender = user address (ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX)');
    console.log('   - mock-sbtc-token-v2.transfer requires tx-sender = sender');
    console.log('   - This will always fail with ERR_UNAUTHORIZED');
    console.log('');
    console.log('💡 The Fix Needed:');
    console.log('   The contract should use ft-transfer? instead of contract-call?');
    console.log('   OR the transfer should be done by the user, not the contract');
    console.log('');
    console.log('🎯 This explains why the deposit is failing!');
    console.log('   The contract logic is fundamentally flawed.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testContractBug();
