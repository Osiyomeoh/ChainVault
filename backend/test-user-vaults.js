const { StacksTestnet } = require('@stacks/network');
const { callReadOnlyFunction } = require('@stacks/transactions');

async function testUserVaults() {
  const network = new StacksTestnet();
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

  console.log('Testing user vault tracking functions...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);

  try {
    // Test get-user-vaults function
    console.log('\n1. Testing get-user-vaults...');
    const userVaultsResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-user-vaults',
      functionArgs: [userAddress],
      network,
      senderAddress: userAddress
    });
    
    console.log('get-user-vaults response:', userVaultsResponse);
    
    // Test get-user-vault-count function
    console.log('\n2. Testing get-user-vault-count...');
    const userVaultCountResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-user-vault-count',
      functionArgs: [userAddress],
      network,
      senderAddress: userAddress
    });
    
    console.log('get-user-vault-count response:', userVaultCountResponse);
    
    // Test get-total-vaults function
    console.log('\n3. Testing get-total-vaults...');
    const totalVaultsResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-total-vaults',
      functionArgs: [],
      network,
      senderAddress: userAddress
    });
    
    console.log('get-total-vaults response:', totalVaultsResponse);
    
  } catch (error) {
    console.error('Error testing user vault functions:', error);
  }
}

testUserVaults();
