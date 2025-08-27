# sBTC Inheritance System

## Overview

The ChainVault contract now includes a complete sBTC inheritance system that enables automatic Bitcoin inheritance payouts when conditions are met. This system leverages Stacks' sBTC (Synthetic Bitcoin) to make Bitcoin programmable and automatically distributable according to inheritance rules.

## Key Features

### 1. sBTC Integration
- **Direct sBTC Transfers**: Uses the official sBTC contract for secure Bitcoin transfers
- **Balance Tracking**: Maintains real-time sBTC balances per vault
- **Automatic Payouts**: Executes inheritance distributions without manual intervention

### 2. Inheritance Flow
1. **Vault Creation**: User creates an inheritance vault with specified parameters
2. **sBTC Deposit**: Vault owner deposits sBTC into the vault
3. **Beneficiary Setup**: Designate beneficiaries with allocation percentages
4. **Proof of Life**: Regular check-ins to maintain active status
5. **Inheritance Trigger**: Automatic or manual inheritance activation
6. **sBTC Distribution**: Automatic payout to beneficiaries

### 3. Security Features
- **Owner-Only Operations**: Only vault owners can deposit/withdraw funds
- **Beneficiary Verification**: Beneficiaries must prove identity to claim inheritance
- **Status Tracking**: Comprehensive audit trail of all operations
- **Emergency Controls**: Contract owner can pause operations if needed

## Technical Implementation

### Contract Constants
```clarity
;; sBTC contract interface
(define-constant SBTC_CONTRACT 'ST1PQHQKV0RJX86F46JZX85EV9S8GKRGPA1DTGJEM.sbtc-alpha)
(define-constant SBTC_TRANSFER_FUNCTION 'transfer)
```

### Data Structures

#### Vault sBTC Balance
```clarity
(define-map vault-sbtc-balances
  { vault-id: (string-utf8 36) }
  { sbtc-amount: uint, last-updated: uint }
)
```

#### sBTC Payout Tracking
```clarity
(define-map sbtc-payouts
  { vault-id: (string-utf8 36), beneficiary-index: uint }
  { 
    amount: uint, 
    payout-status: (string-utf8 20), 
    payout-block: uint,
    transaction-id: (buff 32)
  }
)
```

## Core Functions

### 1. sBTC Deposit
```clarity
(define-public (deposit-sbtc-to-vault
  (vault-id (string-utf8 36))
  (amount uint))
```

**Purpose**: Allows vault owners to deposit sBTC into their inheritance vault.

**Process**:
1. Verifies vault ownership and active status
2. Transfers sBTC from owner to contract
3. Updates vault balance and total BTC value
4. Records transaction details

**Usage Example**:
```typescript
// Deposit 1 sBTC (1,000,000,000 sats)
await contract.depositSbtcToVault({
  vaultId: "vault-123...",
  amount: 1000000000
});
```

### 2. sBTC Withdrawal
```clarity
(define-public (withdraw-sbtc-from-vault
  (vault-id (string-utf8 36))
  (amount uint))
```

**Purpose**: Allows vault owners to withdraw sBTC from their vault while active.

**Process**:
1. Verifies sufficient balance
2. Transfers sBTC from contract to owner
3. Updates balances and tracking
4. Maintains inheritance integrity

### 3. Inheritance Payout Execution
```clarity
(define-public (execute-sbtc-inheritance-payout
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
```

**Purpose**: Executes automatic sBTC inheritance payout to beneficiaries.

**Process**:
1. Verifies inheritance has been triggered
2. Calculates beneficiary allocation
3. Transfers sBTC to beneficiary
4. Records payout details
5. Updates vault status

**Usage Example**:
```typescript
// Beneficiary claims their inheritance
await contract.executeSbtcInheritancePayout({
  vaultId: "vault-123...",
  beneficiaryIndex: 0
});
```

## Inheritance Workflow

### Step 1: Vault Setup
```typescript
// Create vault
const vaultId = await contract.createVault({
  vaultName: "My Inheritance Vault",
  inheritanceDelay: 100, // 100 blocks
  gracePeriod: 50,
  privacyLevel: 2
});

// Add beneficiaries
await contract.addBeneficiary({
  vaultId,
  beneficiaryIndex: 0,
  beneficiaryAddress: "ST2...",
  allocationPercentage: 6000, // 60%
  conditions: "Primary beneficiary"
});
```

### Step 2: Fund Management
```typescript
// Deposit sBTC
await contract.depositSbtcToVault({
  vaultId,
  amount: 1000000000 // 1 sBTC
});

// Check balance
const balance = await contract.getVaultSbtcBalance(vaultId);
```

### Step 3: Inheritance Execution
```typescript
// Trigger inheritance (after delay + grace period)
await contract.triggerInheritance(vaultId);

// Beneficiaries claim their inheritance
await contract.executeSbtcInheritancePayout({
  vaultId,
  beneficiaryIndex: 0
});
```

## Query Functions

### Balance Queries
```clarity
;; Get vault sBTC balance
(define-read-only (get-vault-sbtc-balance (vault-id (string-utf8 36)))

;; Get total sBTC under management
(define-read-only (get-total-sbtc-under-management))

;; Get inheritance readiness status
(define-read-only (get-vault-inheritance-readiness (vault-id (string-utf8 36)))
```

### Payout Status
```clarity
;; Get payout status for specific beneficiary
(define-read-only (get-sbtc-payout-status
  (vault-id (string-utf8 36))
  (beneficiary-index uint)))
```

## Error Handling

### Error Codes
- `ERR_INSUFFICIENT_FUNDS (u113)`: Insufficient sBTC balance
- `ERR_SBTC_TRANSFER_FAILED (u114)`: sBTC transfer operation failed
- `ERR_INVALID_AMOUNT (u115)`: Invalid amount specified
- `ERR_INHERITANCE_NOT_DUE (u104)`: Inheritance conditions not met

### Error Prevention
- **Balance Checks**: Verify sufficient funds before operations
- **Status Validation**: Ensure vault is in correct state
- **Ownership Verification**: Confirm caller has appropriate permissions
- **Transaction Rollback**: Automatic rollback on failed operations

## Security Considerations

### 1. Access Control
- Only vault owners can deposit/withdraw funds
- Only beneficiaries can claim inheritance
- Contract owner has emergency controls

### 2. Fund Safety
- sBTC transfers use official contract interface
- All operations are atomic (all-or-nothing)
- Comprehensive audit trail maintained

### 3. Inheritance Integrity
- Beneficiaries cannot claim before inheritance is triggered
- Allocation percentages are enforced
- No double-spending possible

## Testing

The system includes comprehensive tests covering:
- Complete inheritance flow
- Deposit/withdrawal operations
- Inheritance readiness checks
- Error handling and edge cases

Run tests with:
```bash
cd contracts/chain-vault
npm run test
```

## Future Enhancements

### 1. Automated Triggers
- Time-based automatic inheritance activation
- Multi-signature inheritance triggers
- Conditional inheritance based on external events

### 2. Advanced Allocation
- Gradual inheritance distribution
- Conditional beneficiary activation
- Dynamic allocation adjustments

### 3. Integration Features
- Bitcoin address monitoring
- Cross-chain inheritance bridges
- Professional advisor integrations

## Conclusion

The sBTC inheritance system transforms Bitcoin from a static asset into a programmable inheritance solution. By leveraging Stacks' sBTC, users can:

- **Automate Inheritance**: Set up automatic distributions
- **Maintain Control**: Keep funds accessible while alive
- **Ensure Fairness**: Enforce allocation percentages
- **Track Everything**: Complete audit trail of operations

This system demonstrates the power of making Bitcoin programmable while maintaining the security and reliability that makes Bitcoin valuable as a store of wealth.
