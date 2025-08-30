const { makeContractCall, broadcastTransaction, AnchorMode, standardPrincipalCV, uintCV } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { StacksMocknet } = require('@stacks/network');

// Configuration
const NETWORK = new StacksTestnet();
const MOCK_SBTC_CONTRACT = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX'; // Replace with actual user address
const DEPLOYER_PRIVATE_KEY = 'your-deployer-private-key-here'; // Replace with actual private key

async function mintTestSBTC() {
  try {
    console.log('🪙 Minting test sBTC tokens...');
    console.log('Network:', NETWORK);
    console.log('Contract:', MOCK_SBTC_CONTRACT);
    console.log('User Address:', USER_ADDRESS);
    
    // Mint 1 sBTC (100,000,000 sats) for testing
    const mintAmount = 100000000; // 1 sBTC in sats
    
    const mintTransaction = await makeContractCall({
      contractAddress: MOCK_SBTC_CONTRACT.split('.')[0],
      contractName: MOCK_SBTC_CONTRACT.split('.')[1],
      functionName: 'mint',
      functionArgs: [
        standardPrincipalCV(USER_ADDRESS),
        uintCV(mintAmount)
      ],
      senderAddress: USER_ADDRESS,
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      fee: 5000,
      nonce: 0, // You'll need to get the actual nonce
    });
    
    console.log('✅ Mint transaction created successfully!');
    console.log('Transaction ID:', mintTransaction.txid());
    console.log('Amount minted:', mintAmount / 100000000, 'sBTC');
    
    // Note: You'll need to sign and broadcast this transaction
    console.log('\n📝 Next steps:');
    console.log('1. Sign the transaction with your private key');
    console.log('2. Broadcast it to the network');
    console.log('3. Wait for confirmation');
    console.log('4. Then try depositing sBTC to your vault');
    
  } catch (error) {
    console.error('❌ Failed to mint test sBTC:', error);
  }
}

// Alternative: Use the existing mint script
async function useExistingMintScript() {
  console.log('🔄 Using existing mint script...');
  console.log('Run: node mint-mock-sbtc.js');
  console.log('This will mint sBTC tokens that you can then deposit');
}

// Main execution
console.log('🚀 Test sBTC Minting Script');
console.log('============================');
console.log('');

// Check if we have the required configuration
if (!DEPLOYER_PRIVATE_KEY || DEPLOYER_PRIVATE_KEY === 'your-deployer-private-key-here') {
  console.log('⚠️  Please update the DEPLOYER_PRIVATE_KEY in this script');
  console.log('   Or use the existing mint script: node mint-mock-sbtc.js');
  useExistingMintScript();
} else {
  mintTestSBTC();
}
