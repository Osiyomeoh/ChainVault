import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV } = txPkg;

async function testMultipleVaults() {
  const network = STACKS_TESTNET;
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

  console.log('🔍 Testing Multiple Vaults Detection...');
  console.log('User:', userAddress);
  console.log('Contract:', contractAddress);

  try {
    // Test 1: Check get-user-vaults function
    console.log('\n1. Testing get-user-vaults function...');
    console.log('=====================================');
    
    try {
      const userVaultsResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName: 'chainvault-core-v3',
        functionName: 'get-user-vaults',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      
      console.log('get-user-vaults response:', userVaultsResponse);
      
      if (userVaultsResponse && userVaultsResponse.type === 'list' && userVaultsResponse.value) {
        const vaultIds = userVaultsResponse.value;
        console.log('✅ Found vault IDs in list:', vaultIds);
        console.log('Number of vaults:', vaultIds.length);
        
        // Extract string values
        const extractedVaultIds = vaultIds.map((vaultId) => {
          if (typeof vaultId === 'string') {
            return vaultId;
          } else if (vaultId && typeof vaultId === 'object' && vaultId.type === 'utf8') {
            return vaultId.value;
          } else {
            return String(vaultId);
          }
        });
        
        console.log('Extracted vault IDs:', extractedVaultIds);
        
        // Query each vault individually
        for (const vaultId of extractedVaultIds) {
          console.log(`\n--- Querying Vault: ${vaultId} ---`);
          try {
            const vaultData = await fetchCallReadOnlyFunction({
              contractAddress,
              contractName: 'chainvault-core-v3',
              functionName: 'get-vault',
              functionArgs: [stringUtf8CV(vaultId)],
              network,
              senderAddress: userAddress
            });
            
            console.log(`Vault ${vaultId} data:`, vaultData);
          } catch (vaultError) {
            console.log(`❌ Failed to query vault ${vaultId}:`, vaultError.message);
          }
        }
      } else if (userVaultsResponse && userVaultsResponse.type === 'none') {
        console.log('❌ get-user-vaults returned none - no vaults found');
      } else {
        console.log('❌ Unexpected response format:', userVaultsResponse);
      }
    } catch (error) {
      console.log('❌ get-user-vaults function failed:', error.message);
    }

    // Test 2: Check get-total-vaults function
    console.log('\n2. Testing get-total-vaults function...');
    console.log('=====================================');
    
    try {
      const totalVaultsResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName: 'chainvault-core-v3',
        functionName: 'get-total-vaults',
        functionArgs: [],
        network,
        senderAddress: userAddress
      });
      
      console.log('get-total-vaults response:', totalVaultsResponse);
    } catch (error) {
      console.log('❌ get-total-vaults function failed:', error.message);
    }

    // Test 3: Check get-user-vault-count function
    console.log('\n3. Testing get-user-vault-count function...');
    console.log('==========================================');
    
    try {
      const userVaultCountResponse = await fetchCallReadOnlyFunction({
        contractAddress,
        contractName: 'chainvault-core-v3',
        functionName: 'get-user-vault-count',
        functionArgs: [standardPrincipalCV(userAddress)],
        network,
        senderAddress: userAddress
      });
      
      console.log('get-user-vault-count response:', userVaultCountResponse);
    } catch (error) {
      console.log('❌ get-user-vault-count function failed:', error.message);
    }

    // Test 4: Check if there are other vaults with different patterns
    console.log('\n4. Testing alternative vault detection...');
    console.log('==========================================');
    
    // Try to find vaults with different naming patterns
    const possibleVaultIds = [
      'vault-1756388148258-GY15HX',  // Known working vault
      'vault-1756388148258-GY15HX-1', // Possible variation
      'vault-1756388148258-GY15HX-2', // Possible variation
      'vault-1756388148258-GY15HX-3', // Possible variation
      'vault-1756388148258-GY15HX-4', // Possible variation
      'vault-1756388148258-GY15HX-5'  // Possible variation
    ];
    
    for (const vaultId of possibleVaultIds) {
      try {
        const vaultData = await fetchCallReadOnlyFunction({
          contractAddress,
          contractName: 'chainvault-core-v3',
          functionName: 'get-vault',
          functionArgs: [stringUtf8CV(vaultId)],
          network,
          senderAddress: userAddress
        });
        
        if (vaultData && vaultData.type !== 'none') {
          console.log(`✅ Found vault: ${vaultId}`);
          console.log('Vault data:', vaultData);
        } else {
          console.log(`❌ Vault not found: ${vaultId}`);
        }
      } catch (vaultError) {
        console.log(`❌ Error checking vault ${vaultId}:`, vaultError.message);
      }
    }

    // Test 5: Check contract state maps
    console.log('\n5. Checking contract state maps...');
    console.log('==================================');
    
    try {
      const response = await fetch('https://api.testnet.hiro.so/extended/v1/contract/ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.chainvault-core-v3');
      if (response.ok) {
        const contractData = await response.json();
        console.log('Contract data available');
        
        // Check if there are any maps that might contain vault data
        if (contractData.abi) {
          try {
            const abi = JSON.parse(contractData.abi);
            if (abi.maps) {
              console.log('Available maps:', abi.maps.map((m) => m.name));
            }
          } catch (abiError) {
            console.log('Failed to parse ABI');
          }
        }
      } else {
        console.log('❌ Contract data not accessible');
      }
    } catch (error) {
      console.log('❌ Failed to fetch contract data:', error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('===========');
    console.log('The issue is likely one of these:');
    console.log('1. Only one vault was actually created');
    console.log('2. Multiple vaults exist but get-user-vaults only returns one');
    console.log('3. Vault creation is working but retrieval is limited');
    console.log('4. The contract function has a limitation on returned vaults');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMultipleVaults();
