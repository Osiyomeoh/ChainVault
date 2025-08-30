import { fetchCallReadOnlyFunction, stringUtf8CV, uintCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v4';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const TEST_VAULT_ID = 'vault-1756420585679-GY15HX';

async function testTransferIssue() {
  try {
    console.log('🔍 Testing transfer issue in deposit function...');
    console.log('Vault ID:', TEST_VAULT_ID);
    console.log('User:', USER_ADDRESS);
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    
    // Test 1: Check if we can call the deposit function (this will fail due to transfer issue)
    console.log('\n1. Testing deposit function call...');
    try {
      // This should fail because the transfer direction is wrong
      const depositResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'deposit-sbtc',
        functionArgs: [stringUtf8CV(TEST_VAULT_ID), uintCV(1000000)], // 0.01 sBTC
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      console.log('Deposit response:', depositResponse);
      
    } catch (error) {
      console.log('❌ Deposit function failed as expected:', error.message);
      console.log('This confirms the transfer direction issue!');
    }
    
    // Test 2: Check the mock-sbtc-token contract directly
    console.log('\n2. Testing mock-sbtc-token contract...');
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
    
    console.log('\n🔍 ANALYSIS:');
    console.log('The deposit function is failing because:');
    console.log('1. The contract calls mock-sbtc-token-v2.transfer');
    console.log('2. But transfer requires tx-sender = sender');
    console.log('3. When the contract calls it, tx-sender = contract address');
    console.log('4. This causes an authorization error');
    
  } catch (error) {
    console.error('❌ Error testing transfer issue:', error);
  }
}

testTransferIssue();
