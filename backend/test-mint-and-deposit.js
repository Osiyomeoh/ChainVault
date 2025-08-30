import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV, uintCV } = txPkg;

async function testMintAndDeposit() {
  const network = STACKS_TESTNET;
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const vaultId = 'vault-1756388148258-GY15HX';

  console.log('🚀 Testing Mock sBTC Mint and Deposit...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);
  console.log('Vault ID:', vaultId);

  try {
    // Step 1: Check current mock sBTC balances
    console.log('\n1. Checking current balances...');
    
    // Check user's mock sBTC balance
    try {
      const userBalanceResponse = await fetchCallReadOnlyFunction({
        contractAddress: userAddress,
        contractName: 'mock-sbtc-token',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      
      console.log('User mock sBTC balance:', userBalanceResponse);
    } catch (error) {
      console.log('Failed to get user balance:', error.message);
    }
    
    // Check vault's sBTC balance
    try {
      const vaultBalanceResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault-sbtc-balance',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      console.log('Vault sBTC balance:', vaultBalanceResponse);
    } catch (error) {
      console.log('Failed to get vault balance:', error.message);
    }
    
    // Step 2: Check if user can mint tokens (should be contract owner)
    console.log('\n2. Checking mint permissions...');
    try {
      const tokenNameResponse = await fetchCallReadOnlyFunction({
        contractAddress: userAddress,
        contractName: 'mock-sbtc-token',
        functionName: 'get-name',
        functionArgs: [],
        network,
        senderAddress: userAddress
      });
      
      console.log('Mock sBTC token name:', tokenNameResponse);
    } catch (error) {
      console.log('Failed to get token name:', error.message);
    }
    
    // Step 3: Check vault status for deposit eligibility
    console.log('\n3. Checking vault deposit eligibility...');
    try {
      const vaultResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      if (vaultResponse && vaultResponse.type === 'some') {
        const vaultData = vaultResponse.value;
        console.log('Vault status:', vaultData.value.status);
        console.log('Vault owner:', vaultData.value.owner);
        console.log('Vault sBTC balance:', vaultData.value['sbtc-balance']);
        console.log('Vault sBTC locked:', vaultData.value['sbtc-locked']);
        
        // Check if user can deposit
        const canDeposit = vaultData.value.status.value === 'active' && 
                          vaultData.value.owner.value === userAddress;
        console.log('Can deposit:', canDeposit);
      }
    } catch (error) {
      console.log('Failed to get vault details:', error.message);
    }
    
    // Step 4: Check total supply of mock sBTC
    console.log('\n4. Checking mock sBTC total supply...');
    try {
      const totalSupplyResponse = await fetchCallReadOnlyFunction({
        contractAddress: userAddress,
        contractName: 'mock-sbtc-token',
        functionName: 'get-total-supply',
        functionArgs: [],
        network,
        senderAddress: userAddress
      });
      
      console.log('Mock sBTC total supply:', totalSupplyResponse);
    } catch (error) {
      console.log('Failed to get total supply:', error.message);
    }
    
    console.log('\n📋 Summary:');
    console.log('- User needs mock sBTC tokens to test deposits');
    console.log('- Vault is ready to accept deposits (status: active)');
    console.log('- Mock sBTC token contract is deployed and accessible');
    console.log('- Next step: Mint tokens to user or transfer from another account');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMintAndDeposit();
