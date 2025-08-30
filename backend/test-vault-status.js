import { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const NETWORK = STACKS_TESTNET;
const CONTRACT_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const CONTRACT_NAME = 'chainvault-core-v4';
const USER_ADDRESS = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
const TEST_VAULT_ID = 'vault-1756420585679-GY15HX';

async function checkVaultStatus() {
  try {
    console.log('🔍 Checking vault status for deposit eligibility...');
    console.log('Vault ID:', TEST_VAULT_ID);
    console.log('User:', USER_ADDRESS);
    console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    
    // Test 1: Check if vault exists and get its details
    console.log('\n1. Getting vault details...');
    try {
      const vaultResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-vault',
        functionArgs: [stringUtf8CV(TEST_VAULT_ID)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      console.log('Vault response type:', vaultResponse.type);
      
      if (vaultResponse && vaultResponse.type === 'some') {
        const vault = vaultResponse.value;
        console.log('\n✅ Vault found!');
        console.log('Vault data type:', vault.type);
        
        // Extract values from the tuple safely
        const vaultData = vault.value;
        if (vaultData) {
          console.log('Available fields:', Object.keys(vaultData));
          
          const owner = vaultData.owner?.value;
          const status = vaultData.status?.value;
          const sbtcBalance = vaultData['sbtc-balance']?.value;
          const sbtcLocked = vaultData['sbtc-locked']?.value;
          
          console.log('Owner:', owner);
          console.log('Status:', status);
          console.log('sBTC Balance:', sbtcBalance);
          console.log('sBTC Locked:', sbtcLocked);
          
          // Check if user can deposit
          const isOwner = owner === USER_ADDRESS;
          const isActive = status === 'active';
          
          console.log('\n🔍 Deposit Eligibility Check:');
          console.log('Is owner:', isOwner);
          console.log('Is active:', isActive);
          console.log('Can deposit:', isOwner && isActive);
          
          if (!isOwner) {
            console.log('❌ ERROR: User is not the vault owner!');
          }
          if (!isActive) {
            console.log('❌ ERROR: Vault status is not active!');
          }
        } else {
          console.log('❌ Vault data structure is invalid');
        }
        
      } else if (vaultResponse && vaultResponse.type === 'none') {
        console.log('❌ ERROR: Vault not found!');
      } else {
        console.log('❌ Unexpected vault response format:', vaultResponse);
      }
      
    } catch (error) {
      console.log('❌ get-vault failed:', error.message);
    }
    
    // Test 2: Check user's sBTC balance
    console.log('\n2. Checking user sBTC balance...');
    try {
      const balanceResponse = await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'mock-sbtc-token-v2',
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(USER_ADDRESS)],
        network: NETWORK,
        senderAddress: USER_ADDRESS
      });
      
      if (balanceResponse && balanceResponse.type === 'uint') {
        const balanceInSats = Number(balanceResponse.value);
        const balanceInSbtc = balanceInSats / 100000000;
        console.log('✅ User sBTC Balance:', balanceInSbtc, 'sBTC');
      } else {
        console.log('❌ Unexpected balance response:', balanceResponse);
      }
      
    } catch (error) {
      console.log('❌ get-balance failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking vault status:', error);
  }
}

checkVaultStatus();
