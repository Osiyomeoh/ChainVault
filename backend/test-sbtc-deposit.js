import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV } = txPkg;

async function testSBTCDeposit() {
  const network = STACKS_TESTNET;
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const vaultId = 'vault-1756388148258-GY15HX';

  console.log('Testing sBTC Deposit functionality...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);
  console.log('Vault ID:', vaultId);

  try {
    // Test 1: Get current vault sBTC balance
    console.log('\n1. Getting current vault sBTC balance...');
    try {
      const balanceResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault-sbtc-balance',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      console.log('Current vault sBTC balance:', balanceResponse);
    } catch (error) {
      console.log('get-vault-sbtc-balance failed:', error.message);
    }
    
    // Test 2: Get mock sBTC balance for user
    console.log('\n2. Getting user mock sBTC balance...');
    try {
      const mockSbtcAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
      const mockSbtcName = 'mock-sbtc-token';
      
      const userBalanceResponse = await fetchCallReadOnlyFunction({
        contractAddress: mockSbtcAddress,
        contractName: mockSbtcName,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      
      console.log('User mock sBTC balance:', userBalanceResponse);
    } catch (error) {
      console.log('get-balance failed:', error.message);
    }
    
    // Test 3: Get vault details to see current state
    console.log('\n3. Getting vault details...');
    try {
      const vaultResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      console.log('Vault details:', vaultResponse);
      
      // Test 4: Check if user can deposit (vault status)
      console.log('\n4. Checking vault status for deposit eligibility...');
      if (vaultResponse && vaultResponse.type === 'some') {
        const vault = vaultResponse.value;
        console.log('Vault status:', vault.status);
        console.log('Vault owner:', vault.owner);
        console.log('Can deposit:', vault.status === 'active' && vault.owner === userAddress);
      }
    } catch (error) {
      console.log('get-vault failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error testing sBTC deposit:', error);
  }
}

testSBTCDeposit();
