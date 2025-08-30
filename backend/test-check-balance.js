import { fetchCallReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const SBTC_CONTRACT = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2';
const NETWORK = STACKS_TESTNET;

async function checkUserBalance() {
  try {
    console.log('🔍 Checking user sBTC balance...');
    console.log('User:', USER_ADDRESS);
    console.log('Contract:', SBTC_CONTRACT);
    
    // Get user's sBTC balance
    const balanceResponse = await fetchCallReadOnlyFunction({
      network: NETWORK,
      contractAddress: 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX',
      contractName: 'mock-sbtc-token-v2',
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(USER_ADDRESS)],
      senderAddress: USER_ADDRESS
    });

    console.log('Balance response:', balanceResponse);
    
    if (balanceResponse && balanceResponse.type === 'uint') {
      const balanceInSats = Number(balanceResponse.value);
      const balanceInSbtc = balanceInSats / 100000000; // Convert sats to sBTC
      
      console.log('✅ User sBTC Balance:');
      console.log(`   Raw (sats): ${balanceInSats}`);
      console.log(`   Formatted: ${balanceInSbtc} sBTC`);
      
      if (balanceInSats === 0) {
        console.log('⚠️  WARNING: User has 0 sBTC balance!');
        console.log('   You need to mint sBTC tokens first before depositing.');
      }
      
    } else {
      console.log('❌ Unexpected balance response format:', balanceResponse);
    }
    
  } catch (error) {
    console.error('❌ Failed to check balance:', error);
  }
}

checkUserBalance();
