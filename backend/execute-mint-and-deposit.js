import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';
import { request } from '@stacks/connect';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV, uintCV } = txPkg;

async function executeMintAndDeposit() {
  const network = STACKS_TESTNET;
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const vaultId = 'vault-1756388148258-GY15HX';

  console.log('🚀 EXECUTING REAL MINT AND DEPOSIT TRANSACTIONS...');
  console.log('User:', userAddress);
  console.log('Vault ID:', vaultId);
  console.log('Network: Testnet');

  try {
    // Step 1: Check current balances
    console.log('\n📊 STEP 1: Checking Current Balances');
    console.log('=====================================');
    
    const userBalance = await fetchCallReadOnlyFunction({
      contractAddress: userAddress,
      contractName: 'mock-sbtc-token',
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: userAddress
    });
    
    const vaultBalance = await fetchCallReadOnlyFunction({
      contractAddress: userAddress,
      contractName: 'chainvault-core-v3',
      functionName: 'get-vault-sbtc-balance',
      functionArgs: [stringUtf8CV(vaultId)],
      network,
      senderAddress: userAddress
    });
    
    console.log('Current User sBTC Balance:', userBalance);
    console.log('Current Vault sBTC Balance:', vaultBalance);
    
    // Step 2: Execute Mint Transaction
    console.log('\n🪙 STEP 2: Executing Mint Transaction');
    console.log('=====================================');
    
    const mintAmount = 1000000000; // 1 sBTC
    console.log(`Minting ${mintAmount} sats (1 sBTC) to user...`);
    
    try {
      // Execute the mint transaction using Stacks Connect
      const mintResponse = await request('stx_callContract', {
        contract: `${userAddress}.mock-sbtc-token`,
        functionName: 'mint',
        functionArgs: [
          { type: 'uint', value: mintAmount.toString() },
          { type: 'principal', value: userAddress }
        ],
        network: 'testnet'
      });
      
      console.log('✅ Mint transaction submitted successfully!');
      console.log('Transaction ID:', mintResponse.txid);
      console.log('Status:', mintResponse.status);
      
      // Wait a bit for the transaction to be processed
      console.log('⏳ Waiting for transaction to be processed...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error('❌ Mint transaction failed:', error);
      console.log('This might be because the wallet is not connected or the user rejected the transaction.');
      console.log('Continuing with simulated results for testing...');
    }
    
    // Step 3: Check balances after mint (or simulate)
    console.log('\n💰 STEP 3: Checking Balances After Mint');
    console.log('========================================');
    
    try {
      const postMintUserBalance = await fetchCallReadOnlyFunction({
        contractAddress: userAddress,
        contractName: 'mock-sbtc-token',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      
      console.log('User sBTC Balance after mint:', postMintUserBalance);
      
      // If mint was successful, proceed with deposit
      if (postMintUserBalance && postMintUserBalance.type === 'uint' && postMintUserBalance.value > 0) {
        console.log('✅ Mint successful! Proceeding with deposit...');
        
        // Step 4: Execute Deposit Transaction
        console.log('\n📥 STEP 4: Executing Deposit Transaction');
        console.log('========================================');
        
        const depositAmount = 500000000; // 0.5 sBTC
        console.log(`Depositing ${depositAmount} sats (0.5 sBTC) to vault...`);
        
        try {
          const depositResponse = await request('stx_callContract', {
            contract: `${userAddress}.chainvault-core-v3`,
            functionName: 'deposit-sbtc',
            functionArgs: [
              { type: 'string-utf8', value: vaultId },
              { type: 'uint', value: depositAmount.toString() }
            ],
            network: 'testnet'
          });
          
          console.log('✅ Deposit transaction submitted successfully!');
          console.log('Transaction ID:', depositResponse.txid);
          console.log('Status:', depositResponse.status);
          
          // Wait for deposit transaction to be processed
          console.log('⏳ Waiting for deposit transaction to be processed...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          
        } catch (error) {
          console.error('❌ Deposit transaction failed:', error);
          console.log('This might be because the wallet is not connected or the user rejected the transaction.');
        }
        
        // Step 5: Check final balances
        console.log('\n🏦 STEP 5: Checking Final Balances');
        console.log('==================================');
        
        try {
          const finalUserBalance = await fetchCallReadOnlyFunction({
            contractAddress: userAddress,
            contractName: 'mock-sbtc-token',
            functionName: 'get-balance',
            functionArgs: [standardPrincipalCV(userAddress)],
            network,
            senderAddress: userAddress
          });
          
          const finalVaultBalance = await fetchCallReadOnlyFunction({
            contractAddress: userAddress,
            contractName: 'chainvault-core-v3',
            functionName: 'get-vault-sbtc-balance',
            functionArgs: [stringUtf8CV(vaultId)],
            network,
            senderAddress: userAddress
          });
          
          console.log('Final User sBTC Balance:', finalUserBalance);
          console.log('Final Vault sBTC Balance:', finalVaultBalance);
          
          // Verify the results
          console.log('\n✅ VERIFICATION RESULTS');
          console.log('=======================');
          
          if (finalVaultBalance && finalVaultBalance.type === 'uint' && finalVaultBalance.value > 0) {
            console.log('✅ Deposit successful! Vault now has sBTC balance.');
            console.log('✅ User can now test inheritance trigger.');
            console.log('✅ Transaction history will show the deposit.');
          } else {
            console.log('⚠️  Deposit may not have completed yet. Check transaction status.');
          }
          
        } catch (error) {
          console.error('Error checking final balances:', error);
        }
        
      } else {
        console.log('⚠️  Mint was not successful. Cannot proceed with deposit.');
        console.log('Please check your wallet connection and try again.');
      }
      
    } catch (error) {
      console.error('Error checking post-mint balance:', error);
    }
    
    // Step 6: Summary and next steps
    console.log('\n🎯 SUMMARY AND NEXT STEPS');
    console.log('==========================');
    console.log('1. Mint transaction: Attempted to mint 1 sBTC to user');
    console.log('2. Deposit transaction: Attempted to deposit 0.5 sBTC to vault');
    console.log('3. Check transaction status in your wallet or explorer');
    console.log('4. Verify balances have updated correctly');
    console.log('5. Test inheritance trigger if vault has sBTC balance');
    
    console.log('\n🔗 Useful Links:');
    console.log('- Testnet Explorer: https://explorer.hiro.so');
    console.log('- Your Vault: Check the transaction history');
    console.log('- Frontend: Test the deposit modal in the UI');
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    console.log('\n💡 Troubleshooting Tips:');
    console.log('1. Make sure your wallet is connected to testnet');
    console.log('2. Ensure you have enough STX for transaction fees');
    console.log('3. Check that the contracts are deployed correctly');
    console.log('4. Verify you have the correct permissions');
  }
}

// Execute the script
executeMintAndDeposit();
