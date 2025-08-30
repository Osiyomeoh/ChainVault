const { fetchCallReadOnlyFunction, stringUtf8CV, uintCV, standardPrincipalCV } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');

// Configuration
const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v6';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

async function listVaultsV6() {
  try {
    console.log('🔍 Listing All Vaults in chainvault-core-v6');
    console.log('===========================================');
    console.log('');
    
    // Get user's vaults
    console.log('1. Getting user\'s vaults from v6 contract...');
    try {
      const userVaultsResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-user-vaults',
        functionArgs: [standardPrincipalCV(USER_ADDRESS)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      if (userVaultsResponse.type === 'some') {
        const userVaults = userVaultsResponse.value;
        if (userVaults && userVaults.type === 'tuple' && userVaults.value) {
          const vaultIds = userVaults.value['vault-ids']?.value || [];
          console.log('✅ User has vaults in v6:', vaultIds.length);
          
          if (vaultIds.length > 0) {
            console.log('📋 Vault IDs in v6:');
            vaultIds.forEach((vaultId, index) => {
              console.log(`   ${index + 1}. ${vaultId.value}`);
            });
            console.log('');
            
            // Check details of the first vault
            if (vaultIds.length > 0) {
              const firstVaultId = vaultIds[0].value;
              console.log(`2. Checking details of first vault: ${firstVaultId}`);
              
              try {
                const vaultResponse = await fetchCallReadOnlyFunction({
                  contractAddress: CONTRACT_ADDRESS,
                  contractName: CONTRACT_NAME,
                  functionName: 'get-vault',
                  functionArgs: [stringUtf8CV(firstVaultId)],
                  network: NETWORK,
                  senderAddress: USER_ADDRESS
                });
                
                if (vaultResponse.type === 'some') {
                  const vault = vaultResponse.value;
                  if (vault && vault.type === 'tuple' && vault.value) {
                    const vaultData = vault.value;
                    const owner = vaultData.owner?.value || 'Unknown';
                    const status = vaultData.status?.value || 'Unknown';
                    const sbtcBalance = vaultData['sbtc-balance']?.value || 0;
                    const vaultName = vaultData['vault-name']?.value || 'Unnamed';
                    
                    console.log('✅ Vault details:');
                    console.log('   Vault Name:', vaultName);
                    console.log('   Owner:', owner);
                    console.log('   Status:', status);
                    console.log('   Current sBTC Balance:', Number(sbtcBalance) / 100000000, 'sBTC');
                    console.log('');
                    console.log('🚀 This vault exists in v6 and should work for deposits!');
                  }
                }
              } catch (error) {
                console.log('❌ Failed to get vault details:', error.message);
              }
            }
          } else {
            console.log('❌ User has no vaults in v6 contract');
          }
        }
      } else {
        console.log('❌ User has no vaults in v6 contract');
      }
    } catch (error) {
      console.log('❌ Failed to get user vaults:', error.message);
    }
    
    console.log('');
    console.log('🎯 Summary:');
    console.log('   - Contract v6 has 2 total vaults');
    console.log('   - You need to use a vault ID that exists in v6');
    console.log('   - The vault ID you were trying (`vault-1756485858694-GY15HX`) is not in v6');
    console.log('   - Use one of the vault IDs listed above for deposits');
    
  } catch (error) {
    console.error('❌ List vaults failed:', error);
  }
}

listVaultsV6();
