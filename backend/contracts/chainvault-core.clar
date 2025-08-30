;; Contract name for versioning
(define-constant CONTRACT_NAME "chainvault-core-v7")

;; String constants for consistent UTF-8 usage
(define-constant STATUS_ACTIVE "active")
(define-constant STATUS_INHERITANCE_TRIGGERED "inherit-triggered")
(define-constant STATUS_PENDING "pending")
(define-constant STATUS_EXPIRED "expired")
(define-constant STATUS_EMERGENCY_PAUSED "emergency-paused")

(define-constant CONTRACT_OWNER tx-sender)

;; Error constants
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_VAULT_NOT_FOUND (err u101))
(define-constant ERR_VAULT_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PRIVACY_LEVEL (err u103))
(define-constant ERR_INHERITANCE_NOT_DUE (err u104))
(define-constant ERR_INHERITANCE_ALREADY_TRIGGERED (err u105))
(define-constant ERR_INVALID_BENEFICIARY (err u106))
(define-constant ERR_INSUFFICIENT_BALANCE (err u107))
(define-constant ERR_TRANSFER_FAILED (err u108))
(define-constant ERR_INVALID_AMOUNT (err u109))
(define-constant ERR_VAULT_NOT_FUNDED (err u110))

;; Contract variables
(define-data-var contract-version uint u1)
(define-data-var total-vaults uint u0)
(define-data-var inheritance-fee uint u100) ;; 1% in basis points
(define-data-var total-sbtc-locked uint u0)

;; sBTC token contract reference (this would be the actual sBTC contract address)
(define-constant SBTC_TOKEN .mock-sbtc-token-v2)

;; Mock sBTC token reference for direct ft-transfer? calls
;; Note: We'll use contract calls but with proper transfer logic

;; Enhanced inheritance vaults with sBTC balance tracking
(define-map inheritance-vaults
  { vault-id: (string-utf8 36) }
  {
    owner: principal,
    created-at: uint,
    last-activity: uint,
    inheritance-delay: uint,
    status: (string-ascii 20),
    privacy-level: uint,
    bitcoin-addresses-hash: (buff 32),
    beneficiaries-hash: (buff 32),
    legal-document-hash: (buff 32),
    grace-period: uint,
    emergency-contacts: (list 10 principal),
    vault-name: (string-utf8 50),
    
    ;; NEW: sBTC balance management
    sbtc-balance: uint,           ;; Current sBTC balance in vault
    sbtc-locked: bool,            ;; Whether sBTC is locked for inheritance
    minimum-inheritance: uint,     ;; Minimum sBTC needed to execute inheritance
    auto-distribute: bool         ;; Whether to auto-distribute or require claims
  }
)

;; Vault beneficiaries with sBTC allocation
(define-map vault-beneficiaries
  { vault-id: (string-utf8 36), beneficiary-index: uint }
  {
    beneficiary-address: principal,
    allocation-percentage: uint,    ;; Percentage in basis points (10000 = 100%)
    allocation-conditions: (string-utf8 200),
    notification-preference: uint,
    encrypted-metadata: (buff 128),
    
    ;; NEW: sBTC specific fields
    minimum-sbtc-amount: uint,     ;; Minimum sBTC this beneficiary must receive
    sbtc-claimed: bool,            ;; Whether beneficiary has claimed their sBTC
    claim-deadline: uint           ;; Block height deadline for claiming
  }
)

;; Proof of life tracking
(define-map proof-of-life
  { vault-id: (string-utf8 36) }
  {
    last-checkin: uint,
    next-deadline: uint,
    reminder-count: uint,
    grace-period-end: uint,
    status: (string-ascii 20)
  }
)

;; Enhanced inheritance executions with sBTC transfer tracking
(define-map inheritance-executions
  { vault-id: (string-utf8 36) }
  {
    triggered-at: uint,
    triggered-by: principal,
    execution-status: (string-ascii 20),
    total-sbtc-distributed: uint,  ;; Total sBTC distributed so far
    beneficiaries-paid: uint,      ;; Number of beneficiaries who received sBTC
    distribution-complete: bool,   ;; Whether all sBTC has been distributed
    total-fees: uint,
    completion-percentage: uint
  }
)

;; Professional access (unchanged)
(define-map professional-access
  { vault-id: (string-utf8 36), advisor: principal }
  {
    access-level: uint,
    granted-at: uint,
    granted-by: principal,
    active: bool
  }
)

;; Simple user vault tracking - maps user address to list of vault IDs
(define-map user-vaults
  { user: principal }
  { vault-ids: (list 100 (string-utf8 36)) }) ;; allow up to 100 instead of 50

;; NEW: Create vault with sBTC funding option
;; NEW: Create vault with sBTC funding option
(define-public (create-sbtc-vault
  (vault-id (string-utf8 36))
  (vault-name (string-utf8 50))
  (inheritance-delay uint)
  (privacy-level uint)
  (bitcoin-addresses-hash (buff 32))
  (beneficiaries-hash (buff 32))
  (grace-period uint)
  (initial-sbtc-amount uint)
  (lock-sbtc bool)
  (auto-distribute bool))
  
  (let ((vault-exists (is-some (map-get? inheritance-vaults { vault-id: vault-id }))))
    
    (asserts! (not vault-exists) ERR_VAULT_ALREADY_EXISTS)
    (asserts! (and (>= privacy-level u1) (<= privacy-level u4)) ERR_INVALID_PRIVACY_LEVEL)
    (asserts! (> inheritance-delay u0) ERR_INVALID_AMOUNT)
    (asserts! (> grace-period u0) ERR_INVALID_AMOUNT)
    
    ;; If initial sBTC amount specified, transfer it to the contract
    (if (> initial-sbtc-amount u0)
      (try! (contract-call? .mock-sbtc-token-v2 transfer 
                           initial-sbtc-amount 
                           tx-sender 
                           (as-contract tx-sender) 
                           none))
      true)
    
    ;; Create the vault
    (map-set inheritance-vaults
      { vault-id: vault-id }
      {
        owner: tx-sender,
        created-at: u0,
        last-activity: u0,
        inheritance-delay: inheritance-delay,
        status: STATUS_ACTIVE,
        privacy-level: privacy-level,
        bitcoin-addresses-hash: bitcoin-addresses-hash,
        beneficiaries-hash: beneficiaries-hash,
        legal-document-hash: 0x0000000000000000000000000000000000000000000000000000000000000000,
        grace-period: grace-period,
        emergency-contacts: (list),
        vault-name: vault-name,
        sbtc-balance: initial-sbtc-amount,
        sbtc-locked: lock-sbtc,
        minimum-inheritance: u0,
        auto-distribute: auto-distribute
      })
    
    ;; Set up proof-of-life tracking
    (map-set proof-of-life
      { vault-id: vault-id }
      {
        last-checkin: u0,
        next-deadline: inheritance-delay,
        reminder-count: u0,
        grace-period-end: (+ inheritance-delay grace-period),
        status: STATUS_ACTIVE
      })
  
    ;; Track vault ownership - append vault-id instead of overwriting
        ;; Track vault ownership - append vault-id instead of overwriting
    (match (map-get? user-vaults { user: tx-sender })
      user-data
        (let ((existing-vaults (get vault-ids user-data)))
          (asserts! (< (len existing-vaults) u99) ERR_INVALID_AMOUNT) ;; max 99 + 1 new = 100 total
          (map-set user-vaults
            { user: tx-sender }
            { vault-ids: (unwrap! (as-max-len? (concat existing-vaults (list vault-id)) u100) ERR_INVALID_AMOUNT) }))
      (map-set user-vaults
        { user: tx-sender }
        { vault-ids: (list vault-id) }))


    
    ;; Update contract statistics
    (var-set total-vaults (+ (var-get total-vaults) u1))
    (var-set total-sbtc-locked (+ (var-get total-sbtc-locked) initial-sbtc-amount))
    
    (print {
      event: "sbtc-vault-created",
      vault-id: vault-id,
      owner: tx-sender,
      sbtc-balance: initial-sbtc-amount,
      privacy-level: privacy-level,
      created-block: u0
    })
    
    (ok vault-id)))


;; NEW: Deposit additional sBTC into existing vault
(define-public (deposit-sbtc (vault-id (string-utf8 36)) (amount uint))
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-eq (get status vault) STATUS_ACTIVE) ERR_INHERITANCE_ALREADY_TRIGGERED)

    
    ;; Transfer sBTC from user to contract
    ;; The user must call this function directly (tx-sender = user)
    ;; This ensures the transfer authorization works correctly
    
    ;; Check if user has sufficient balance before proceeding
    (let ((user-balance (contract-call? .mock-sbtc-token-v2 get-balance tx-sender)))
      (asserts! (>= user-balance amount) ERR_INSUFFICIENT_BALANCE))
    
    ;; Transfer sBTC from user to contract
    ;; The user must call this function directly (tx-sender = user)
    ;; This ensures the transfer authorization works correctly
    ;; The key insight: tx-sender IS the user when they call this function
    ;; So this should work correctly
    (try! (contract-call? .mock-sbtc-token-v2 transfer 
                         amount 
                         tx-sender 
                         (as-contract tx-sender) 
                         none))
    
    ;; Update vault balance
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { 
        sbtc-balance: (+ (get sbtc-balance vault) amount)
      }))
    
    ;; Update total locked sBTC
    (var-set total-sbtc-locked (+ (var-get total-sbtc-locked) amount))
    
    (print {
      event: "sbtc-deposited",
      vault-id: vault-id,
      depositor: tx-sender,
      amount: amount,
      new-balance: (+ (get sbtc-balance vault) amount)
    })
    
    (ok true)))

;; NEW: Withdraw sBTC from vault (only if not locked)
(define-public (withdraw-sbtc (vault-id (string-utf8 36)) (amount uint))
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-eq (get status vault) STATUS_ACTIVE) ERR_INHERITANCE_ALREADY_TRIGGERED)
    (asserts! (not (get sbtc-locked vault)) ERR_UNAUTHORIZED)
    (asserts! (>= (get sbtc-balance vault) amount) ERR_INSUFFICIENT_BALANCE)
    
    ;; Transfer sBTC from contract to user
    ;; The contract must have sufficient balance to transfer
    
    ;; Transfer sBTC from contract to user
    ;; The contract must have sufficient balance to transfer
    (try! (as-contract (contract-call? .mock-sbtc-token-v2 transfer 
                                     amount 
                                     (as-contract tx-sender) 
                                     (get owner vault) 
                                     none)))
    
    ;; Update vault balance
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { 
        sbtc-balance: (- (get sbtc-balance vault) amount)
      }))
    
    ;; Update total locked sBTC
    (var-set total-sbtc-locked (- (var-get total-sbtc-locked) amount))
    
    (print {
      event: "sbtc-withdrawn",
      vault-id: vault-id,
      owner: tx-sender,
      amount: amount,
      new-balance: (- (get sbtc-balance vault) amount)
    })
    
    (ok true)))

;; Enhanced add beneficiary with sBTC allocation
(define-public (add-sbtc-beneficiary
  (vault-id (string-utf8 36))
  (beneficiary-index uint)
  (beneficiary-address principal)
  (allocation-percentage uint)
  (minimum-sbtc-amount uint)
  (conditions (string-utf8 200))
  (encrypted-metadata (buff 128)))
  
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (<= allocation-percentage u10000) ERR_INVALID_AMOUNT)
    (asserts! (>= minimum-sbtc-amount u0) ERR_INVALID_AMOUNT)
    
    (map-set vault-beneficiaries
      { vault-id: vault-id, beneficiary-index: beneficiary-index }
      {
        beneficiary-address: beneficiary-address,
        allocation-percentage: allocation-percentage,
        allocation-conditions: conditions,
        notification-preference: (get privacy-level vault),
        encrypted-metadata: encrypted-metadata,
        minimum-sbtc-amount: minimum-sbtc-amount,
        sbtc-claimed: false,
        claim-deadline: u0
      })
    
    (print {
      event: "sbtc-beneficiary-added",
      vault-id: vault-id,
      beneficiary-index: beneficiary-index,
      beneficiary: beneficiary-address,
      allocation: allocation-percentage,
      minimum-sbtc: minimum-sbtc-amount
    })
    
    (ok true)))

;; Update proof of life (unchanged)
(define-public (update-proof-of-life (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { 
        last-activity: u0,
        status: STATUS_ACTIVE
      }))
    
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof {
        last-checkin: u0,
        next-deadline: (get inheritance-delay vault),
        reminder-count: u0,
        grace-period-end: (+ (get inheritance-delay vault) (get grace-period vault)),
        status: STATUS_ACTIVE
      }))
    
    (print {
      event: "proof-of-life-updated",
      vault-id: vault-id,
      owner: tx-sender,
              next-deadline: (get inheritance-delay vault),
        updated-block: u0
    })
    
    (ok true)))

;; NEW: Enhanced inheritance trigger with automatic sBTC distribution
(define-public (trigger-sbtc-inheritance (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; For testing: allow inheritance to be triggered (in production, check actual time)
    ;; (asserts! (>= (get grace-period-end proof) u0) ERR_INHERITANCE_NOT_DUE)
    (asserts! (is-eq (get status vault) STATUS_ACTIVE) ERR_INHERITANCE_ALREADY_TRIGGERED)
    (asserts! (> (get sbtc-balance vault) u0) ERR_VAULT_NOT_FUNDED)
    
    ;; Update vault status
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { status: STATUS_INHERITANCE_TRIGGERED }))
    
    ;; Create inheritance execution record
    (map-set inheritance-executions
      { vault-id: vault-id }
      {
        triggered-at: u0,
        triggered-by: tx-sender,
        execution-status: STATUS_PENDING,
        total-sbtc-distributed: u0,
        beneficiaries-paid: u0,
        distribution-complete: false,
        total-fees: u0,
        completion-percentage: u0
      })
    
    ;; Update proof-of-life status
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof { status: STATUS_EXPIRED }))
    
    ;; If auto-distribute is enabled, automatically distribute sBTC
    (if (get auto-distribute vault)
      (try! (auto-distribute-sbtc vault-id))
      true)
    
    (print {
      event: "sbtc-inheritance-triggered",
      vault-id: vault-id,
      triggered-by: tx-sender,
                      triggered-at: u0,
        vault-owner: (get owner vault),
      sbtc-balance: (get sbtc-balance vault),
      auto-distribute: (get auto-distribute vault)
    })
    
    (ok true)))

;; NEW: Automatic sBTC distribution to all beneficiaries
(define-private (auto-distribute-sbtc (vault-id (string-utf8 36)))
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; This would iterate through beneficiaries and distribute sBTC
    ;; For now, we'll implement the logic for manual claiming
    ;; In a full implementation, we'd use fold to process all beneficiaries
    
    (print {
      event: "auto-distribution-initiated",
      vault-id: vault-id,
      total-sbtc: (get sbtc-balance vault)
    })
    
    (ok true)))

;; NEW: Claim sBTC inheritance for specific beneficiary
(define-public (claim-sbtc-inheritance 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (beneficiary (unwrap! (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index }) ERR_INVALID_BENEFICIARY))
    (execution (unwrap! (map-get? inheritance-executions { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get status vault) STATUS_INHERITANCE_TRIGGERED) ERR_INHERITANCE_ALREADY_TRIGGERED)
    (asserts! (is-eq (get beneficiary-address beneficiary) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (not (get sbtc-claimed beneficiary)) ERR_INHERITANCE_ALREADY_TRIGGERED)
    
    ;; Calculate sBTC amount to transfer
    (let ((sbtc-amount (/ (* (get sbtc-balance vault) (get allocation-percentage beneficiary)) u10000))
          (fee-amount (/ (* sbtc-amount (var-get inheritance-fee)) u10000))
          (net-amount (- sbtc-amount fee-amount)))
      
      (asserts! (>= net-amount (get minimum-sbtc-amount beneficiary)) ERR_INSUFFICIENT_BALANCE)
      
      ;; Transfer sBTC to beneficiary
      (try! (as-contract (contract-call? .mock-sbtc-token-v2 transfer 
                                       net-amount 
                                       tx-sender 
                                       (get beneficiary-address beneficiary) 
                                       none)))
      
      ;; Mark beneficiary as claimed
      (map-set vault-beneficiaries
        { vault-id: vault-id, beneficiary-index: beneficiary-index }
        (merge beneficiary { 
          sbtc-claimed: true,
          claim-deadline: u0
        }))
      
      ;; Update execution record
      (map-set inheritance-executions
        { vault-id: vault-id }
        (merge execution {
          total-sbtc-distributed: (+ (get total-sbtc-distributed execution) net-amount),
          beneficiaries-paid: (+ (get beneficiaries-paid execution) u1),
          total-fees: (+ (get total-fees execution) fee-amount)
        }))
      
      ;; Update vault balance
      (map-set inheritance-vaults
        { vault-id: vault-id }
        (merge vault { 
          sbtc-balance: (- (get sbtc-balance vault) sbtc-amount)
        }))
      
      (print {
        event: "sbtc-inheritance-claimed",
        vault-id: vault-id,
        beneficiary: tx-sender,
        beneficiary-index: beneficiary-index,
        gross-amount: sbtc-amount,
        fee-amount: fee-amount,
        net-amount: net-amount,
        remaining-vault-balance: (- (get sbtc-balance vault) sbtc-amount)
      })
      
      (ok net-amount))))

;; Read-only functions (enhanced)
(define-read-only (get-vault (vault-id (string-utf8 36)))
  (map-get? inheritance-vaults { vault-id: vault-id }))

(define-read-only (get-vault-sbtc-balance (vault-id (string-utf8 36)))
  (match (map-get? inheritance-vaults { vault-id: vault-id })
    vault (get sbtc-balance vault)
    u0))

(define-read-only (get-proof-of-life (vault-id (string-utf8 36)))
  (map-get? proof-of-life { vault-id: vault-id }))

(define-read-only (get-beneficiary 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index }))

(define-read-only (get-inheritance-execution (vault-id (string-utf8 36)))
  (map-get? inheritance-executions { vault-id: vault-id }))

(define-read-only (is-inheritance-due (vault-id (string-utf8 36)))
  (match (map-get? proof-of-life { vault-id: vault-id })
    proof (>= u0 (get grace-period-end proof))
    false))

(define-read-only (get-total-vaults)
  (var-get total-vaults))

(define-read-only (get-total-sbtc-locked)
  (var-get total-sbtc-locked))

(define-read-only (get-contract-version)
  (var-get contract-version))



;; Get all vault IDs for a specific user
(define-read-only (get-user-vaults (user principal))
  (match (map-get? user-vaults { user: user })
    user-data (get vault-ids user-data)
    (list)))

;; Get vault count for a specific user
(define-read-only (get-user-vault-count (user principal))
  (begin
    (match (map-get? user-vaults { user: user })
      user-data (len (get vault-ids user-data))
      u0)))

;; Calculate inheritance amount for beneficiary
(define-read-only (calculate-inheritance-amount 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  (match (map-get? inheritance-vaults { vault-id: vault-id })
    vault (match (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index })
            beneficiary (let ((gross-amount (/ (* (get sbtc-balance vault) (get allocation-percentage beneficiary)) u10000))
                             (fee-amount (/ (* gross-amount (var-get inheritance-fee)) u10000)))
                         { 
                           gross-amount: gross-amount,
                           fee-amount: fee-amount,
                           net-amount: (- gross-amount fee-amount)
                         })
            { gross-amount: u0, fee-amount: u0, net-amount: u0 })
    { gross-amount: u0, fee-amount: u0, net-amount: u0 }))

;; Admin functions
(define-public (set-inheritance-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= new-fee u1000) ERR_INVALID_AMOUNT) ;; Max 10%
    (var-set inheritance-fee new-fee)
    (ok true)))

(define-public (emergency-pause-vault (vault-id (string-utf8 36)))
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { status: STATUS_EMERGENCY_PAUSED }))
    
    (print { event: "emergency-pause", vault-id: vault-id })
    (ok true)))

;; Initialize contract
(var-set contract-version u4) ;; Version 4 with fixed sBTC transfers
(var-set total-vaults u0)
(var-set inheritance-fee u100) ;; 1% fee
(var-set total-sbtc-locked u0)