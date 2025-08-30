const { makeContractCall, stringUtf8CV, uintCV, standardPrincipalCV, AnchorMode, broadcastTransaction } = require('@stacks/transactions');
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

// NOTE: You'll need to provide your private key to actually sign and broadcast
// const PRIVATE_KEY = 'your-private-key-here'; // Uncomment and add your key

async function testRealDeposit() {
  try {
    console.log('🧪 Testing Real Deposit to Contract v6');
    console.log('=====================================');
    console.log('');
    
    console.log('📋 Configuration:');
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log('Vault ID:', TEST_VAULT_ID);
    console.log('User:', USER_ADDRESS);
    console.log('Deposit Amount:', DEPOSIT_AMOUNT, 'sats (', DEPOSIT_AMOUNT / 100000000, 'sBTC)');
    console.log('');
    
    // Step 1: Create the contract call
    console.log('1. Creating contract call...');
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
    console.log('Arguments count:', contractCall.functionArgs.length);
    console.log('Post-conditions count:', contractCall.postConditions.length);
    console.log('');
    
    // Step 2: Check if we have a private key
    if (typeof PRIVATE_KEY === 'undefined') {
      console.log('2. Private key not provided - showing transaction structure only');
      console.log('To actually execute this transaction, you need to:');
      console.log('1. Uncomment and set PRIVATE_KEY in this script');
      console.log('2. Sign the transaction with your private key');
      console.log('3. Broadcast it to the network');
      console.log('');
      console.log('💡 This will help us see if the issue is with:');
      console.log('   - Contract logic');
      console.log('   - Transaction structure');
      console.log('   - Post-conditions');
      console.log('   - Wallet behavior');
      return;
    }
    
    // Step 3: Sign and broadcast (if private key is provided)
    console.log('2. Signing transaction...');
    // const signedTx = signTransaction(contractCall, PRIVATE_KEY);
    // console.log('✅ Transaction signed');
    
    // console.log('3. Broadcasting transaction...');
    // const result = await broadcastTransaction(signedTx, NETWORK);
    // console.log('✅ Transaction broadcasted:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('');
    console.log('🔍 Error Analysis:');
    if (error.message.includes('post-condition')) {
      console.log('   - This is a post-condition error');
      console.log('   - The wallet is adding restrictive conditions');
    } else if (error.message.includes('insufficient')) {
      console.log('   - This is a balance/authorization error');
      console.log('   - Check user balance and vault ownership');
    } else if (error.message.includes('contract')) {
      console.log('   - This is a contract logic error');
      console.log('   - The contract function is failing');
    } else {
      console.log('   - This is an unexpected error');
      console.log('   - Check the full error message above');
    }
  }
}

testRealDeposit();
