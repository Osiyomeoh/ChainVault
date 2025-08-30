import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV } = txPkg;

// Helper function to safely serialize data with BigInts
function safeStringify(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }, 2);
}

async function debugVaultData() {
  const network = STACKS_TESTNET;
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const vaultId = 'vault-1756388148258-GY15HX';

  console.log('🔍 Debugging Vault Data Structure...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);
  console.log('Vault ID:', vaultId);

  try {
    // Test 1: Get vault details and inspect raw structure
    console.log('\n1. Getting raw vault data...');
    try {
      const vaultResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      console.log('Raw vault response:', safeStringify(vaultResponse));
      
      // Inspect the structure
      if (vaultResponse && vaultResponse.type === 'some') {
        const vaultData = vaultResponse.value;
        console.log('\nVault data type:', vaultData.type);
        console.log('Vault data keys:', Object.keys(vaultData.value));
        
        // Show each field
        for (const [key, value] of Object.entries(vaultData.value)) {
          if (typeof value === 'bigint') {
            console.log(`${key}: ${value.toString()} (BigInt)`);
          } else {
            console.log(`${key}:`, value);
          }
        }
      }
    } catch (error) {
      console.log('get-vault failed:', error.message);
    }
    
    // Test 2: Get proof of life and inspect raw structure
    console.log('\n2. Getting raw proof of life data...');
    try {
      const proofResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-proof-of-life',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      
      console.log('Raw proof response:', safeStringify(proofResponse));
      
      // Inspect the structure
      if (proofResponse && proofResponse.type === 'some') {
        const proofData = proofResponse.value;
        console.log('\nProof data type:', proofData.type);
        console.log('Proof data keys:', Object.keys(proofData.value));
        
        // Show each field
        for (const [key, value] of Object.entries(proofData.value)) {
          if (typeof value === 'bigint') {
            console.log(`${key}: ${value.toString()} (BigInt)`);
          } else {
            console.log(`${key}:`, value);
          }
        }
      }
    } catch (error) {
      console.log('get-proof-of-life failed:', error.message);
    }
    
  } catch (error) {
    console.error('Debug failed:', error);
  }
}

debugVaultData();
