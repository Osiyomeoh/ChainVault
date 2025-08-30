const { StacksTestnet } = require('@stacks/network');
const { callReadOnlyFunction } = require('@stacks/transactions');

async function testProofOfLife() {
  const network = new StacksTestnet();
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

  console.log('Testing Proof of Life functionality...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);

  try {
    // Test 1: Get current proof of life status
    console.log('\n1. Getting current proof of life status...');
    const proofOfLifeResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-proof-of-life',
      functionArgs: ['vault-1756388148258-GY15HX'],
      network,
      senderAddress: userAddress
    });
    
    console.log('Current proof of life status:', proofOfLifeResponse);
    
    // Test 2: Get vault details to see last activity
    console.log('\n2. Getting vault details...');
    const vaultResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-vault',
      functionArgs: ['vault-1756388148258-GY15HX'],
      network,
      senderAddress: userAddress
    });
    
    console.log('Vault details:', vaultResponse);
    
    // Test 3: Check if inheritance can be triggered
    console.log('\n3. Checking inheritance readiness...');
    const inheritanceReadyResponse = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'can-trigger-inheritance',
      functionArgs: ['vault-1756388148258-GY15HX'],
      network,
      senderAddress: userAddress
    });
    
    console.log('Can trigger inheritance:', inheritanceReadyResponse);
    
  } catch (error) {
    console.error('Error testing proof of life:', error);
  }
}

testProofOfLife();
