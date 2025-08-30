import { fetchCallReadOnlyFunction, stringUtf8CV, uintCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v4';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const TEST_VAULT_ID = 'vault-1756420585679-GY15HX';

async function testFixedContract() {
  try {
    console.log('🧪 Testing Fixed Contract Functions...');
    console.log('Vault ID:', TEST_VAULT_ID);
    console.log('User:', USER_ADDRESS);
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    
    // Test 1: Check vault status
    console.log('\n1. Checking vault status...');
    try {
      const vaultResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(TEST_VAULT_ID)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      if (vaultResponse && vaultResponse.type === 'some') {
        const vault = vaultResponse.value;
        const vaultData = vault.value;
        if (vaultData) {
          const owner = vaultData.owner?.value;
          const status = vaultData.status?.value;
          const sbtcBalance = vaultData['sbtc-balance']?.value;
          
          console.log('✅ Vault Status:');
          console.log('   Owner:', owner);
          console.log('   Status:', status);
          console.log('   sBTC Balance:', sbtcBalance);
          console.log('   Can deposit:', owner === USER_ADDRESS && status === 'active');
        }
      }
      
    } catch (error) {
      console.log('❌ get-vault failed:', error.message);
    }
    
    // Test 2: Check user sBTC balance
    console.log('\n2. Checking user sBTC balance...');
    try {
      const balanceResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'mock-sbtc-token-v2',
        functionName: 'get-balance',
        functionArgs: [stringUtf8CV(USER_ADDRESS)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      if (balanceResponse && balanceResponse.type === 'uint') {
        const balanceInSats = Number(balanceResponse.value);
        const balanceInSbtc = balanceInSats / 100000000;
        console.log('✅ User sBTC Balance:', balanceInSbtc, 'sBTC');
      }
      
    } catch (error) {
      console.log('❌ get-balance failed:', error.message);
    }
    
    // Test 3: Test deposit function (read-only simulation)
    console.log('\n3. Testing deposit function (read-only simulation)...');
    try {
      const depositResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deposit-sbtc',
        functionArgs: [stringUtf8CV(TEST_VAULT_ID), uintCV(1000000)], // 0.01 sBTC
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      console.log('✅ Deposit function simulation successful:', depositResponse);
      
    } catch (error) {
      console.log('❌ Deposit function simulation failed:', error.message);
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('If all tests pass, the contract fixes are working!');
    console.log('The deposit function should now work correctly.');
    
  } catch (error) {
    console.error('❌ Error testing fixed contract:', error);
  }
}

testFixedContract();
