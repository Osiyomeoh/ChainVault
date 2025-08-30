import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';
import { request } from '@stacks/connect';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV, uintCV } = txPkg;

async function mintTokensOnly() {
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

  console.log('🪙 MINTING MOCK SBTC TOKENS ONLY...');
  console.log('User:', userAddress);
  console.log('Network: Testnet');
  console.log('Contract: mock-sbtc-token');

  try {
    // Step 1: Check current balance
    console.log('\n📊 STEP 1: Checking Current Balance');
    console.log('=====================================');
    
    const currentBalance = await fetchCallReadOnlyFunction({
      contractAddress: userAddress,
      contractName: 'mock-sbtc-token',
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(userAddress)],
      network: STACKS_TESTNET,
      senderAddress: userAddress
    });
    
    console.log('Current User sBTC Balance:', currentBalance);
    
    // Step 2: Execute Mint Transaction
    console.log('\n🪙 STEP 2: Executing Mint Transaction');
    console.log('=====================================');
    
    const mintAmount = 1000000000; // 1 sBTC
    console.log(`Minting ${mintAmount} sats (1 sBTC) to user...`);
    console.log('This will prompt your wallet for approval.');
    
    try {
      const mintResponse = await request('stx_callContract', {
        contract: `${userAddress}.mock-sbtc-token`,
        functionName: 'mint',
        functionArgs: [
          { type: 'uint', value: mintAmount.toString() },
          { type: 'principal', value: userAddress }
        ],
        network: 'testnet'
      });
      
      console.log('\n✅ MINT TRANSACTION SUBMITTED SUCCESSFULLY!');
      console.log('============================================');
      console.log('Transaction ID:', mintResponse.txid);
      console.log('Status:', mintResponse.status);
      
      console.log('\n⏳ Waiting for transaction to be processed...');
      console.log('This may take a few minutes on testnet.');
      
      // Wait for transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Step 3: Verify the mint
      console.log('\n🔍 STEP 3: Verifying Mint Transaction');
      console.log('=====================================');
      
      const newBalance = await fetchCallReadOnlyFunction({
        contractAddress: userAddress,
        contractName: 'mock-sbtc-token',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userAddress)],
        network: STACKS_TESTNET,
        senderAddress: userAddress
      });
      
      console.log('New User sBTC Balance:', newBalance);
      
      if (newBalance && newBalance.type === 'uint' && newBalance.value > 0) {
        console.log('\n🎉 SUCCESS! User now has mock sBTC tokens!');
        console.log('============================================');
        console.log('You can now:');
        console.log('1. Test deposits to your vault');
        console.log('2. Use the frontend deposit modal');
        console.log('3. Test inheritance functionality');
      } else {
        console.log('\n⚠️  Balance may not have updated yet.');
        console.log('Check the transaction status in your wallet or explorer.');
      }
      
    } catch (error) {
      console.error('\n❌ MINT TRANSACTION FAILED:', error);
      console.log('\n💡 Common Issues:');
      console.log('1. Wallet not connected to testnet');
      console.log('2. User rejected the transaction');
      console.log('3. Insufficient STX for transaction fees');
      console.log('4. Network connectivity issues');
      
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure your wallet is connected');
      console.log('2. Switch to testnet network');
      console.log('3. Ensure you have some STX for fees');
      console.log('4. Try again in a few minutes');
    }
    
    // Step 4: Summary
    console.log('\n🎯 NEXT STEPS');
    console.log('==============');
    console.log('1. Check transaction status in your wallet');
    console.log('2. Verify balance has increased');
    console.log('3. Test deposit functionality in frontend');
    console.log('4. Run the complete test script if needed');
    
    console.log('\n🔗 Useful Links:');
    console.log('- Testnet Explorer: https://explorer.hiro.so');
    console.log('- Your Wallet: Check transaction history');
    console.log('- Frontend: Test deposit modal');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    console.log('\n💡 Make sure:');
    console.log('1. Your wallet is connected to testnet');
    console.log('2. You have some STX for transaction fees');
    console.log('3. The mock-sbtc-token contract is deployed');
  }
}

// Execute the script
mintTokensOnly();
