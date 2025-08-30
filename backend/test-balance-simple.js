// Simple test script for sBTC balance retrieval
// Run with: node test-balance-simple.js

import { fetchCallReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

async function testBalance() {
  console.log('🔍 Testing sBTC Balance Retrieval...\n');
  
  // Contract details
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'mock-sbtc-token-v2';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const network = STACKS_TESTNET;
  
  console.log('📋 Configuration:');
  console.log(`Contract: ${contractAddress}.${contractName}`);
  console.log(`User: ${userAddress}`);
  console.log(`Network: testnet\n`);
  
  try {
    console.log('🧪 Calling get-balance function...');
    
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: userAddress
    });
    
    console.log('✅ Response received:', result);
    console.log('Response type:', result.type);
    
    if (result && result.type === 'uint') {
      const balance = Number(result.value);
      console.log(`🎉 SUCCESS! Balance: ${balance} sats (${(balance / 100000000).toFixed(8)} sBTC)`);
    } else if (result && result.type === 'response' && result.value) {
      const responseValue = result.value;
      console.log('Response wrapper:', responseValue);
      
      if (responseValue.type === 'ok' && responseValue.value) {
        const balance = Number(responseValue.value.value);
        console.log(`🎉 SUCCESS! Balance: ${balance} sats (${(balance / 100000000).toFixed(8)} sBTC)`);
      } else {
        console.log('❌ Contract error:', responseValue.value);
      }
    } else {
      console.log('❌ Unexpected format:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testBalance().catch(console.error);
