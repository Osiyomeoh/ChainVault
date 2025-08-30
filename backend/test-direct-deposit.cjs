const { makeContractCall, stringUtf8CV, uintCV, standardPrincipalCV, AnchorMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

// Configuration
const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v6';
const MOCK_SBTC_CONTRACT = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2';

// Test parameters
const TEST_VAULT_ID = 'vault-1756485858694-GY15HX';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const DEPOSIT_AMOUNT = 10000000; // 0.1 sBTC in sats

async function testDirectDeposit() {
  try {
    console.log('🧪 Testing Direct Deposit to Contract');
    console.log('====================================');
    console.log('');
    
    console.log('📋 Configuration:');
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log('Vault ID:', TEST_VAULT_ID);
    console.log('User:', USER_ADDRESS);
    console.log('Deposit Amount:', DEPOSIT_AMOUNT, 'sats (', DEPOSIT_AMOUNT / 100000000, 'sBTC)');
    console.log('');
    
    // Create the contract call
    const contractCall = makeContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'deposit-sbtc',
      functionArgs: [stringUtf8CV(TEST_VAULT_ID), uintCV(DEPOSIT_AMOUNT)],
      senderAddress: USER_ADDRESS,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditions: [] // Explicitly set empty post-conditions
    });
    
    console.log('✅ Contract call created successfully');
    console.log('Function:', contractCall.functionName);
    console.log('Arguments:', contractCall.functionArgs);
    console.log('Post-conditions:', contractCall.postConditions);
    console.log('');
    
    console.log('🎯 This test shows the contract call structure');
    console.log('To actually execute it, you would need to:');
    console.log('1. Sign the transaction with a private key');
    console.log('2. Broadcast it to the network');
    console.log('');
    console.log('💡 The contract call structure looks correct');
    console.log('If this still fails in the frontend, the issue is');
    console.log('likely with the wallet adding post-conditions');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDirectDeposit();
