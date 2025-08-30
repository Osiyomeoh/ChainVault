const { StacksTestnet } = require('@stacks/network');
const { callReadOnlyFunction } = require('@stacks/transactions');

async function testSBTCDeposit() {
  const network = new StacksTestnet();
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

  console.log('Testing sBTC Deposit functionality...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);

  try {
    // Test 1: Get current vault sBTC balance
    console.log('\n1. Getting current vault sBTC balance...');
    const balanceResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-vault-sbtc-balance',
      functionArgs: ['vault-1756388148258-GY15HX'],
      network,
      senderAddress: userAddress
    });
    
    console.log('Current vault sBTC balance:', balanceResponse);
    
    // Test 2: Get mock sBTC balance for user
    console.log('\n2. Getting user mock sBTC balance...');
    const mockSbtcAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
    const mockSbtcName = 'mock-sbtc-token';
    
    const userBalanceResponse = await callReadOnlyFunction({
      contractAddress: mockSbtcAddress,
      contractName: mockSbtcName,
      functionName: 'get-balance',
      functionArgs: [userAddress],
      network,
      senderAddress: userAddress
    });
    
    console.log('User mock sBTC balance:', userBalanceResponse);
    
    // Test 3: Get vault details to see current state
    console.log('\n3. Getting vault details...');
    const vaultResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-vault',
      functionArgs: ['vault-1756388148258-GY15HX'],
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
    console.error('Error testing sBTC deposit:', error);
  }
}

testSBTCDeposit();
