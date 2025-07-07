;; ChainVault Core Inheritance Contract
;; File: contracts/chainvault-stacks/contracts/chainvault-core.clar

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_VAULT_NOT_FOUND (err u101))
(define-constant ERR_VAULT_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PRIVACY_LEVEL (err u103))
(define-constant ERR_INHERITANCE_NOT_DUE (err u104))
(define-constant ERR_INHERITANCE_ALREADY_TRIGGERED (err u105))
(define-constant ERR_INVALID_BENEFICIARY (err u106))

;; Data Variables
(define-data-var contract-version uint u1)
(define-data-var total-vaults uint u0)
(define-data-var inheritance-fee uint u100) ;; 1% = 100 basis points

;; Maps

;; Core vault storage
(define-map inheritance-vaults
  { vault-id: (string-utf8 36) }
  {
    owner: principal,
    created-at: uint,
    last-activity: uint,
    inheritance-delay: uint, ;; in blocks (~24 hours = 144 blocks)
    status: (string-utf8 20),
    privacy-level: uint, ;; 1=stealth, 2=delayed, 3=educational, 4=transparent
    
    ;; Encrypted data hashes (actual data stored off-chain)
    bitcoin-addresses-hash: (buff 32),
    beneficiaries-hash: (buff 32),
    legal-document-hash: (buff 32),
    
    ;; Inheritance configuration
    grace-period: uint, ;; additional blocks after inheritance delay
    emergency-contacts: (list 3 principal),
    
    ;; Metadata
    vault-name: (string-utf8 50),
    total-btc-value: uint ;; in satoshis, for fee calculation
  }
)

;; Beneficiary allocations (encrypted mapping)
(define-map vault-beneficiaries
  { vault-id: (string-utf8 36), beneficiary-index: uint }
  {
    beneficiary-address: principal,
    allocation-percentage: uint, ;; basis points (10000 = 100%)
    allocation-conditions: (string-utf8 200),
    notification-preference: uint, ;; matches vault privacy level
    encrypted-metadata: (buff 128) ;; personal info, encrypted
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
    status: (string-utf8 20) ;; "active", "warning", "grace", "expired"
  }
)

;; Inheritance execution tracking
(define-map inheritance-executions
  { vault-id: (string-utf8 36) }
  {
    triggered-at: uint,
    triggered-by: principal,
    execution-status: (string-utf8 20), ;; "pending", "processing", "completed", "failed"
    beneficiary-claims: (list 10 {
      beneficiary: principal,
      amount: uint,
      claimed: bool,
      claim-block: uint
    }),
    total-fees: uint,
    completion-percentage: uint
  }
)

;; Professional advisor access
(define-map professional-access
  { vault-id: (string-utf8 36), advisor: principal }
  {
    access-level: uint, ;; 1=view, 2=document, 3=admin
    granted-at: uint,
    granted-by: principal,
    active: bool
  }
)

;; Public Functions

;; Create a new inheritance vault
(define-public (create-vault
  (vault-id (string-utf8 36))
  (vault-name (string-utf8 50))
  (inheritance-delay uint)
  (privacy-level uint)
  (bitcoin-addresses-hash (buff 32))
  (beneficiaries-hash (buff 32))
  (grace-period uint))
  
  (let ((vault-exists (is-some (map-get? inheritance-vaults { vault-id: vault-id }))))
    
    ;; Validate inputs
    (asserts! (not vault-exists) ERR_VAULT_ALREADY_EXISTS)
    (asserts! (and (>= privacy-level u1) (<= privacy-level u4)) ERR_INVALID_PRIVACY_LEVEL)
    (asserts! (> inheritance-delay u0) (err u107))
    (asserts! (> grace-period u0) (err u108))
    
    ;; Create vault record
    (map-set inheritance-vaults
      { vault-id: vault-id }
      {
        owner: tx-sender,
        created-at: block-height,
        last-activity: block-height,
        inheritance-delay: inheritance-delay,
        status: "active",
        privacy-level: privacy-level,
        bitcoin-addresses-hash: bitcoin-addresses-hash,
        beneficiaries-hash: beneficiaries-hash,
        legal-document-hash: 0x00,
        grace-period: grace-period,
        emergency-contacts: (list),
        vault-name: vault-name,
        total-btc-value: u0
      })
    
    ;; Initialize proof of life
    (map-set proof-of-life
      { vault-id: vault-id }
      {
        last-checkin: block-height,
        next-deadline: (+ block-height inheritance-delay),
        reminder-count: u0,
        grace-period-end: (+ block-height inheritance-delay grace-period),
        status: "active"
      })
    
    ;; Update total vaults counter
    (var-set total-vaults (+ (var-get total-vaults) u1))
    
    ;; Emit event
    (print {
      event: "vault-created",
      vault-id: vault-id,
      owner: tx-sender,
      privacy-level: privacy-level,
      block-height: block-height
    })
    
    (ok vault-id)))

;; Add beneficiary to vault
(define-public (add-beneficiary
  (vault-id (string-utf8 36))
  (beneficiary-index uint)
  (beneficiary-address principal)
  (allocation-percentage uint)
  (conditions (string-utf8 200))
  (encrypted-metadata (buff 128)))
  
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; Verify ownership
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    
    ;; Validate allocation percentage
    (asserts! (<= allocation-percentage u10000) (err u109))
    
    ;; Add beneficiary
    (map-set vault-beneficiaries
      { vault-id: vault-id, beneficiary-index: beneficiary-index }
      {
        beneficiary-address: beneficiary-address,
        allocation-percentage: allocation-percentage,
        allocation-conditions: conditions,
        notification-preference: (get privacy-level vault),
        encrypted-metadata: encrypted-metadata
      })
    
    ;; Emit event
    (print {
      event: "beneficiary-added",
      vault-id: vault-id,
      beneficiary-index: beneficiary-index,
      allocation: allocation-percentage
    })
    
    (ok true)))

;; Update proof of life (check-in)
(define-public (update-proof-of-life (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; Verify ownership
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    
    ;; Update vault activity
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { 
        last-activity: block-height,
        status: "active"
      }))
    
    ;; Update proof of life
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof {
        last-checkin: block-height,
        next-deadline: (+ block-height (get inheritance-delay vault)),
        reminder-count: u0,
        grace-period-end: (+ block-height (get inheritance-delay vault) (get grace-period vault)),
        status: "active"
      }))
    
    ;; Emit event
    (print {
      event: "proof-of-life-updated",
      vault-id: vault-id,
      owner: tx-sender,
      next-deadline: (+ block-height (get inheritance-delay vault)),
      block-height: block-height
    })
    
    (ok true)))

;; Trigger inheritance (can be called by anyone after deadline)
(define-public (trigger-inheritance (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; Check if inheritance is due
    (asserts! (>= block-height (get grace-period-end proof)) ERR_INHERITANCE_NOT_DUE)
    
    ;; Check if not already triggered
    (asserts! (is-eq (get status vault) "active") ERR_INHERITANCE_ALREADY_TRIGGERED)
    
    ;; Update vault status
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { status: "inheritance-triggered" }))
    
    ;; Create inheritance execution record
    (map-set inheritance-executions
      { vault-id: vault-id }
      {
        triggered-at: block-height,
        triggered-by: tx-sender,
        execution-status: "pending",
        beneficiary-claims: (list),
        total-fees: u0,
        completion-percentage: u0
      })
    
    ;; Update proof of life status
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof { status: "expired" }))
    
    ;; Emit event
    (print {
      event: "inheritance-triggered",
      vault-id: vault-id,
      triggered-by: tx-sender,
      triggered-at: block-height,
      vault-owner: (get owner vault)
    })
    
    (ok true)))

;; Claim inheritance (called by beneficiaries)
(define-public (claim-inheritance 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (beneficiary (unwrap! (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index }) ERR_INVALID_BENEFICIARY))
    (execution (unwrap! (map-get? inheritance-executions { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; Verify inheritance is triggered
    (asserts! (is-eq (get status vault) "inheritance-triggered") (err u110))
    
    ;; Verify caller is the beneficiary
    (asserts! (is-eq (get beneficiary-address beneficiary) tx-sender) ERR_UNAUTHORIZED)
    
    ;; Calculate inheritance amount (simplified - actual implementation would involve Bitcoin transfers)
    (let ((inheritance-amount (/ (* (get total-btc-value vault) (get allocation-percentage beneficiary)) u10000)))
      
      ;; Emit event for off-chain processing
      (print {
        event: "inheritance-claimed",
        vault-id: vault-id,
        beneficiary: tx-sender,
        beneficiary-index: beneficiary-index,
        amount: inheritance-amount,
        block-height: block-height
      })
      
      (ok inheritance-amount))))

;; Grant professional advisor access
(define-public (grant-professional-access
  (vault-id (string-utf8 36))
  (advisor principal)
  (access-level uint))
  
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; Verify ownership
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    
    ;; Validate access level
    (asserts! (and (>= access-level u1) (<= access-level u3)) (err u111))
    
    ;; Grant access
    (map-set professional-access
      { vault-id: vault-id, advisor: advisor }
      {
        access-level: access-level,
        granted-at: block-height,
        granted-by: tx-sender,
        active: true
      })
    
    ;; Emit event
    (print {
      event: "professional-access-granted",
      vault-id: vault-id,
      advisor: advisor,
      access-level: access-level,
      granted-by: tx-sender
    })
    
    (ok true)))

;; Read-only functions

;; Get vault details
(define-read-only (get-vault (vault-id (string-utf8 36)))
  (map-get? inheritance-vaults { vault-id: vault-id }))

;; Get vault proof of life status
(define-read-only (get-proof-of-life (vault-id (string-utf8 36)))
  (map-get? proof-of-life { vault-id: vault-id }))

;; Get beneficiary details
(define-read-only (get-beneficiary 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index }))

;; Get inheritance execution status
(define-read-only (get-inheritance-execution (vault-id (string-utf8 36)))
  (map-get? inheritance-executions { vault-id: vault-id }))

;; Check if inheritance is due
(define-read-only (is-inheritance-due (vault-id (string-utf8 36)))
  (match (map-get? proof-of-life { vault-id: vault-id })
    proof (>= block-height (get grace-period-end proof))
    false))

;; Get total number of vaults
(define-read-only (get-total-vaults)
  (var-get total-vaults))

;; Get contract version
(define-read-only (get-contract-version)
  (var-get contract-version))

;; Check professional access
(define-read-only (get-professional-access
  (vault-id (string-utf8 36))
  (advisor principal))
  (map-get? professional-access { vault-id: vault-id, advisor: advisor }))

;; Administrative functions (only contract owner)

;; Update inheritance fee
(define-public (set-inheritance-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= new-fee u1000) (err u112)) ;; Max 10% fee
    (var-set inheritance-fee new-fee)
    (ok true)))

;; Emergency pause (only contract owner)
(define-public (emergency-pause-vault (vault-id (string-utf8 36)))
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { status: "emergency-paused" }))
    
    (print { event: "emergency-pause", vault-id: vault-id })
    (ok true)))

;; Initialize contract (called once during deployment)
(define-private (init-contract)
  (begin
    (var-set contract-version u1)
    (var-set total-vaults u0)
    (var-set inheritance-fee u100)
    (print { event: "contract-initialized", version: u1 })
    true))

;; Contract initialization
(init-contract)