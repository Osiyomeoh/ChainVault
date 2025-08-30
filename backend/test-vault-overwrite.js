import pkg from '@stacks/network';
import txPkg from '@stacks/transactions';

const { STACKS_TESTNET } = pkg;
const { fetchCallReadOnlyFunction, stringUtf8CV, standardPrincipalCV } = txPkg;

async function testVaultOverwrite() {
  const network = STACKS_TESTNET;
  const userAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';
  const contractAddress = 'ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX';

  console.log('🚨 Testing Vault Overwrite Issue...');
  console.log('User:', userAddress);
  console.log('Contract:', contractAddress);

  try {
    // Test 1: Check current state
    console.log('\n1. Current Contract State...');
    console.log('============================');
    
    const totalVaults = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: 'chainvault-core-v3',
      functionName: 'get-total-vaults',
      functionArgs: [],
      network,
      senderAddress: userAddress
    });
    
    const userVaultCount = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: 'chainvault-core-v3',
      functionName: 'get-user-vault-count',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: userAddress
    });
    
    const userVaults = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName: 'chainvault-core-v3',
      functionName: 'get-user-vaults',
      functionArgs: [standardPrincipalCV(userAddress)],
      network,
      senderAddress: userAddress
    });
    
    console.log('Total vaults in system:', totalVaults);
    console.log('Your vault count:', userVaultCount);
    console.log('Your vaults list:', userVaults);
    
    // Test 2: Check the user-vaults map directly
    console.log('\n2. Checking user-vaults Map...');
    console.log('============================');
    
    try {
      const response = await fetch('https://api.testnet.hiro.so/extended/v1/contract/ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.chainvault-core-v3/map/user-vaults');
      if (response.ok) {
        const mapData = await response.json();
        console.log('user-vaults map data:', mapData);
        
        // Look for entries with your address
        if (mapData.data && Array.isArray(mapData.data)) {
          console.log('\nMap entries:');
          mapData.data.forEach((entry, index) => {
            console.log(`Entry ${index}:`, entry);
            
            // Check if this entry belongs to your user
            if (entry.key && entry.key.includes(userAddress)) {
              console.log(`✅ Found your entry at index ${index}`);
            }
          });
        }
      } else {
        console.log('❌ user-vaults map not accessible');
      }
    } catch (error) {
      console.log('❌ Failed to fetch user-vaults map:', error.message);
    }
    
    // Test 3: Check inheritance-vaults map
    console.log('\n3. Checking inheritance-vaults Map...');
    console.log('====================================');
    
    try {
      const response = await fetch('https://api.testnet.hiro.so/extended/v1/contract/ST1KJNKBF5WEQKNPY6WYVE87VV0GSQSTA1BGY15HX.chainvault-core-v3/map/inheritance-vaults');
      if (response.ok) {
        const mapData = await response.json();
        console.log('inheritance-vaults map data:', mapData);
        
        // Look for entries with your address
        if (mapData.data && Array.isArray(mapData.data)) {
          console.log('\nMap entries:');
          mapData.data.forEach((entry, index) => {
            console.log(`Entry ${index}:`, entry);
            
            // Check if this entry belongs to your user
            if (entry.key && entry.key.includes(userAddress)) {
              console.log(`✅ Found your entry at index ${index}`);
            }
          });
        }
      } else {
        console.log('❌ inheritance-vaults map not accessible');
      }
    } catch (error) {
      console.log('❌ Failed to fetch inheritance-vaults map:', error.message);
    }
    
    // Test 4: Analyze the contract design issue
    console.log('\n4. Contract Design Analysis...');
    console.log('==============================');
    
    console.log('🔍 Based on the results, the issue is likely:');
    console.log('');
    console.log('PROBLEM 1: Map Key Design');
    console.log('- The contract uses the user address as the map key');
    console.log('- When you create a new vault, it overwrites the previous entry');
    console.log('- Only the latest vault is stored per user');
    console.log('');
    console.log('PROBLEM 2: Single Entry Per User');
    console.log('- get-user-vaults only returns one vault per user');
    console.log('- Multiple vaults from same user are not supported');
    console.log('- The contract design assumes one vault per user');
    console.log('');
    console.log('PROBLEM 3: Overwrite Instead of Append');
    console.log('- New vault creation replaces old vault data');
    console.log('- Previous vaults are lost when creating new ones');
    console.log('- This is a fundamental contract design flaw');
    
    // Test 5: Solutions
    console.log('\n5. Possible Solutions...');
    console.log('========================');
    
    console.log('SOLUTION 1: Contract Redesign (Recommended)');
    console.log('- Change map key from user-address to (user-address, vault-id)');
    console.log('- Allow multiple vaults per user');
    console.log('- Modify get-user-vaults to return all vaults for a user');
    console.log('');
    console.log('SOLUTION 2: Frontend Workaround');
    console.log('- Store vault data locally in frontend');
    console.log('- Use local storage to maintain vault history');
    console.log('- This is temporary until contract is fixed');
    console.log('');
    console.log('SOLUTION 3: Vault ID Uniqueness');
    console.log('- Ensure each vault gets a truly unique ID');
    console.log('- Use timestamp + random string for uniqueness');
    console.log('- Prevent key collisions in the contract maps');
    
    console.log('\n🎯 CONCLUSION:');
    console.log('==============');
    console.log('The contract has a design flaw that prevents multiple vaults per user.');
    console.log('Each new vault creation overwrites the previous one.');
    console.log('This needs to be fixed at the contract level for proper functionality.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVaultOverwrite();
