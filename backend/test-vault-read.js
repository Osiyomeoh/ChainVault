import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV } = txPkg;

async function testVaultRead() {
  const network = STACKS_TESTNET;
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractName = 'chainvault-core-v3';
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const vaultId = 'vault-1756388148258-GY15HX';

  console.log('Testing vault read functions...');
  console.log('Contract:', `${contractAddress}.${contractName}`);
  console.log('User:', userAddress);
  console.log('Vault ID:', vaultId);

  try {
    // Test 1: Get user vaults
    console.log('\n1. Testing get-user-vaults...');
    try {
      const userVaultsResult = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-user-vaults',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      console.log('User vaults result:', userVaultsResult);
    } catch (error) {
      console.log('get-user-vaults failed:', error.message);
    }

    // Test 2: Get specific vault
    console.log('\n2. Testing get-vault...');
    try {
      const vaultResult = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(vaultId)],
        network,
        senderAddress: userAddress
      });
      console.log('Vault result:', vaultResult);
    } catch (error) {
      console.log('get-vault failed:', error.message);
    }

    // Test 3: Get user vault count
    console.log('\n3. Testing get-user-vault-count...');
    try {
      const countResult = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-user-vault-count',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      console.log('User vault count result:', countResult);
    } catch (error) {
      console.log('get-user-vault-count failed:', error.message);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testVaultRead();
