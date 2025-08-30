import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV } = txPkg;

async function testProofOfLife() {
  const network = STACKS_TESTNET;
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const vaultId = 'vault-1756388148258-GY15HX';

  console.log('Testing Proof of Life functionality...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);
  console.log('Vault ID:', vaultId);

  try {
    // Test 1: Get current proof of life status
    console.log('\n1. Getting current proof of life status...');
    try {
      const proofOfLifeResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-proof-of-life',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      console.log('Current proof of life status:', proofOfLifeResponse);
    } catch (error) {
      console.log('get-proof-of-life failed:', error.message);
    }
    
    // Test 2: Get vault details to see last activity
    console.log('\n2. Getting vault details...');
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
    } catch (error) {
      console.log('get-vault failed:', error.message);
    }
    
    // Test 3: Check if inheritance can be triggered
    console.log('\n3. Checking inheritance readiness...');
    try {
      const inheritanceReadyResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'can-trigger-inheritance',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      console.log('Can trigger inheritance:', inheritanceReadyResponse);
    } catch (error) {
      console.log('can-trigger-inheritance failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error testing proof of life:', error);
  }
}

testProofOfLife();
