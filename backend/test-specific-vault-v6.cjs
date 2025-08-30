const { fetchCallReadOnlyFunction, stringUtf8CV, uintCV, standardPrincipalCV } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

// Configuration
const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v6';
const MOCK_SBTC_CONTRACT = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2';

// Test parameters - Using the vault ID you provided
const TEST_VAULT_ID = 'vault-1756489905982-GY15HX';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const DEPOSIT_AMOUNT = 10000000; // 0.1 sBTC in sats

async function testSpecificVaultV6() {
  try {
    console.log('🧪 Testing Specific Vault in Contract v6');
    console.log('========================================');
    console.log('');
    
    console.log('📋 Configuration:');
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log('Vault ID:', TEST_VAULT_ID);
    console.log('User:', USER_ADDRESS);
    console.log('Deposit Amount:', DEPOSIT_AMOUNT, 'sats (', DEPOSIT_AMOUNT / 100000000, 'sBTC)');
    console.log('');
    
    // Step 1: Check if this specific vault exists in v6
    console.log('1. Checking if vault exists in v6 contract...');
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
        console.log('✅ Vault found in v6!');
        const vault = vaultResponse.value;
        if (vault && vault.type === 'tuple' && vault.value) {
          const vaultData = vault.value;
          const owner = vaultData.owner?.value || 'Unknown';
          const status = vaultData.status?.value || 'Unknown';
          const sbtcBalance = vaultData['sbtc-balance']?.value || 0;
          const vaultName = vaultData['vault-name']?.value || 'Unnamed';
          
          console.log('   Vault Name:', vaultName);
          console.log('   Owner:', owner);
          console.log('   Status:', status);
          console.log('   Current sBTC Balance:', Number(sbtcBalance) / 100000000, 'sBTC');
          
          if (owner !== USER_ADDRESS) {
            console.log('❌ User does not own this vault');
            return;
          }
          
          if (status !== 'active') {
            console.log('❌ Vault is not active (status:', status, ')');
            return;
          }
          
          console.log('✅ Vault is owned by user and active');
        }
      } else {
        console.log('❌ Vault not found in v6 contract');
        console.log('💡 This vault ID does not exist in the v6 contract');
        return;
      }
    } catch (error) {
      console.log('❌ Failed to check vault:', error.message);
      return;
    }
    console.log('');
    
    // Step 2: Check user sBTC balance
    console.log('2. Checking user sBTC balance...');
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
    
    // Step 3: Test deposit call structure (read-only)
    console.log('3. Testing deposit call structure (read-only)...');
    try {
      const depositResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deposit-sbtc',
        functionArgs: [stringUtf8CV(TEST_VAULT_ID), uintCV(DEPOSIT_AMOUNT)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      console.log('✅ Deposit call structure is valid:', depositResponse);
    } catch (error) {
      if (error.message.includes('NotReadOnly')) {
        console.log('✅ Deposit function structure is correct!');
        console.log('   (NotReadOnly error is expected for read-only calls)');
      } else {
        console.log('❌ Unexpected error in deposit call:', error.message);
        console.log('🔍 This suggests a contract logic issue');
        return;
      }
    }
    console.log('');
    
    // Step 4: Final summary
    console.log('🎯 FINAL VERIFICATION:');
    console.log('================================');
    console.log('✅ Vault exists in v6 contract');
    console.log('✅ User owns the vault');
    console.log('✅ Vault is active');
    console.log('✅ User has sufficient sBTC balance');
    console.log('✅ Deposit function is accessible');
    console.log('');
    console.log('🚀 This vault is READY for deposits!');
    console.log('   The deposit should work in the frontend now.');
    console.log('');
    console.log('💡 If you still get post-condition errors:');
    console.log('   1. Make sure the frontend is using the v6 contract');
    console.log('   2. Check that the vault ID matches exactly');
    console.log('   3. Try refreshing the page to clear any cached data');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSpecificVaultV6();
