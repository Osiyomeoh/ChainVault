const { fetchCallReadOnlyFunction, stringUtf8CV, uintCV, standardPrincipalCV } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

// Configuration
const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v5';
const MOCK_SBTC_CONTRACT = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.mock-sbtc-token-v2';
const TEST_VAULT_ID = 'vault-1756485858694-GY15HX';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

async function testDepositDebug() {
  try {
    console.log('🔍 Debugging Deposit Function');
    console.log('==============================');
    console.log('');
    
    // 1. Check initial state
    console.log('1. Initial State Check');
    console.log('------------------------');
    
    // User balance
    const userBalanceResponse = await fetchCallReadOnlyFunction({
      contractAddress: MOCK_SBTC_CONTRACT.split('.')[0],
      contractName: MOCK_SBTC_CONTRACT.split('.')[1],
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(USER_ADDRESS)],
      network: NETWORK,
      senderAddress: USER_ADDRESS
    });
    const userBalance = Number(userBalanceResponse.value);
    console.log('User sBTC Balance:', userBalance / 100000000, 'sBTC');
    
    // Vault balance
    const vaultResponse = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-vault',
      functionArgs: [stringUtf8CV(TEST_VAULT_ID)],
      network: NETWORK,
      senderAddress: USER_ADDRESS
    });
    
    if (vaultResponse.type === 'some') {
      const vault = vaultResponse.value;
      if (vault && vault.type === 'tuple' && vault.value) {
        const vaultData = vault.value;
        const vaultBalance = vaultData['sbtc-balance']?.value || 0;
        console.log('Vault sBTC Balance:', Number(vaultBalance) / 100000000, 'sBTC');
      }
    }
    console.log('');
    
    // 2. Check contract state
    console.log('2. Contract State Check');
    console.log('------------------------');
    
    // Check if the contract has any sBTC
    const contractBalanceResponse = await fetchCallReadOnlyFunction({
      contractAddress: MOCK_SBTC_CONTRACT.split('.')[0],
      contractName: MOCK_SBTC_CONTRACT.split('.')[1],
      functionName: 'get-balance',
      functionArgs: [standardPrincipalCV(CONTRACT_ADDRESS)],
      network: NETWORK,
      senderAddress: USER_ADDRESS
    });
    const contractBalance = Number(contractBalanceResponse.value);
    console.log('Contract sBTC Balance:', contractBalance / 100000000, 'sBTC');
    console.log('');
    
    // 3. Check mock-sbtc-token contract
    console.log('3. Mock sBTC Token Contract Check');
    console.log('----------------------------------');
    
    try {
      // Check if the transfer function exists and is accessible
      const transferCheck = await fetchCallReadOnlyFunction({
        contractAddress: MOCK_SBTC_CONTRACT.split('.')[0],
        contractName: MOCK_SBTC_CONTRACT.split('.')[1],
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(USER_ADDRESS)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      console.log('✅ Mock sBTC token contract is accessible');
    } catch (error) {
      console.log('❌ Mock sBTC token contract error:', error.message);
    }
    console.log('');
    
    // 4. Summary
    console.log('4. Analysis');
    console.log('------------');
    console.log('If the deposit transaction succeeded but:');
    console.log('- User balance unchanged');
    console.log('- Vault balance unchanged');
    console.log('- Contract balance unchanged');
    console.log('');
    console.log('Then the issue is likely:');
    console.log('1. Contract logic bug in deposit-sbtc function');
    console.log('2. Token transfer not executing properly');
    console.log('3. Authorization issue with the transfer');
    console.log('');
    console.log('💡 Check the contract logs or try a smaller amount');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDepositDebug();
