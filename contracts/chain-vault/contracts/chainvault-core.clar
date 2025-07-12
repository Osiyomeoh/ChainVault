;; String constants for consistent UTF-8 usage
(define-constant STATUS_ACTIVE u"active")
(define-constant STATUS_INHERITANCE_TRIGGERED u"inherit-triggered")
(define-constant STATUS_PENDING u"pending")
(define-constant STATUS_EXPIRED u"expired")
(define-constant STATUS_EMERGENCY_PAUSED u"emergency-paused")

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_VAULT_NOT_FOUND (err u101))
(define-constant ERR_VAULT_ALREADY_EXISTS (err u102))
(define-constant ERR_INVALID_PRIVACY_LEVEL (err u103))
(define-constant ERR_INHERITANCE_NOT_DUE (err u104))
(define-constant ERR_INHERITANCE_ALREADY_TRIGGERED (err u105))
(define-constant ERR_INVALID_BENEFICIARY (err u106))

(define-data-var contract-version uint u1)
(define-data-var total-vaults uint u0)
(define-data-var inheritance-fee uint u100)

(define-map inheritance-vaults
  { vault-id: (string-utf8 36) }
  {
    owner: principal,
    created-at: uint,
    last-activity: uint,
    inheritance-delay: uint,
    status: (string-utf8 20),
    privacy-level: uint,
    bitcoin-addresses-hash: (buff 32),
    beneficiaries-hash: (buff 32),
    legal-document-hash: (buff 32),
    grace-period: uint,
    emergency-contacts: (list 10 principal),
    vault-name: (string-utf8 50),
    total-btc-value: uint
  }
)

(define-map vault-beneficiaries
  { vault-id: (string-utf8 36), beneficiary-index: uint }
  {
    beneficiary-address: principal,
    allocation-percentage: uint,
    allocation-conditions: (string-utf8 200),
    notification-preference: uint,
    encrypted-metadata: (buff 128)
  }
)

(define-map proof-of-life
  { vault-id: (string-utf8 36) }
  {
    last-checkin: uint,
    next-deadline: uint,
    reminder-count: uint,
    grace-period-end: uint,
    status: (string-utf8 20)
  }
)

(define-map inheritance-executions
  { vault-id: (string-utf8 36) }
  {
    triggered-at: uint,
    triggered-by: principal,
    execution-status: (string-utf8 20),
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

(define-map professional-access
  { vault-id: (string-utf8 36), advisor: principal }
  {
    access-level: uint,
    granted-at: uint,
    granted-by: principal,
    active: bool
  }
)

(define-public (create-vault
  (vault-id (string-utf8 36))
  (vault-name (string-utf8 50))
  (inheritance-delay uint)
  (privacy-level uint)
  (bitcoin-addresses-hash (buff 32))
  (beneficiaries-hash (buff 32))
  (grace-period uint))
  
  (let ((vault-exists (is-some (map-get? inheritance-vaults { vault-id: vault-id }))))
    
    (asserts! (not vault-exists) ERR_VAULT_ALREADY_EXISTS)
    (asserts! (and (>= privacy-level u1) (<= privacy-level u4)) ERR_INVALID_PRIVACY_LEVEL)
    (asserts! (> inheritance-delay u0) (err u107))
    (asserts! (> grace-period u0) (err u108))
    
    (map-set inheritance-vaults
      { vault-id: vault-id }
      {
        owner: tx-sender,
        created-at: stacks-block-height,
        last-activity: stacks-block-height,
        inheritance-delay: inheritance-delay,
        status: STATUS_ACTIVE,
        privacy-level: privacy-level,
        bitcoin-addresses-hash: bitcoin-addresses-hash,
        beneficiaries-hash: beneficiaries-hash,
        legal-document-hash: 0x0000000000000000000000000000000000000000000000000000000000000000,
        grace-period: grace-period,
        emergency-contacts: (list),
        vault-name: vault-name,
        total-btc-value: u0
      })
    
    (map-set proof-of-life
      { vault-id: vault-id }
      {
        last-checkin: stacks-block-height,
        next-deadline: (+ stacks-block-height inheritance-delay),
        reminder-count: u0,
        grace-period-end: (+ stacks-block-height inheritance-delay grace-period),
        status: STATUS_ACTIVE
      })
    
    (var-set total-vaults (+ (var-get total-vaults) u1))
    
    (print {
      event: "vault-created",
      vault-id: vault-id,
      owner: tx-sender,
      privacy-level: privacy-level,
      stacks-block-height: stacks-block-height
    })
    
    (ok vault-id)))

(define-public (add-beneficiary
  (vault-id (string-utf8 36))
  (beneficiary-index uint)
  (beneficiary-address principal)
  (allocation-percentage uint)
  (conditions (string-utf8 200))
  (encrypted-metadata (buff 128)))
  
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (<= allocation-percentage u10000) (err u109))
    
    (map-set vault-beneficiaries
      { vault-id: vault-id, beneficiary-index: beneficiary-index }
      {
        beneficiary-address: beneficiary-address,
        allocation-percentage: allocation-percentage,
        allocation-conditions: conditions,
        notification-preference: (get privacy-level vault),
        encrypted-metadata: encrypted-metadata
      })
    
    (print {
      event: "beneficiary-added",
      vault-id: vault-id,
      beneficiary-index: beneficiary-index,
      allocation: allocation-percentage
    })
    
    (ok true)))

(define-public (update-proof-of-life (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { 
        last-activity: stacks-block-height,
        status: STATUS_ACTIVE
      }))
    
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof {
        last-checkin: stacks-block-height,
        next-deadline: (+ stacks-block-height (get inheritance-delay vault)),
        reminder-count: u0,
        grace-period-end: (+ stacks-block-height (get inheritance-delay vault) (get grace-period vault)),
        status: STATUS_ACTIVE
      }))
    
    (print {
      event: "proof-of-life-updated",
      vault-id: vault-id,
      owner: tx-sender,
      next-deadline: (+ stacks-block-height (get inheritance-delay vault)),
      stacks-block-height: stacks-block-height
    })
    
    (ok true)))

(define-public (trigger-inheritance (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (>= stacks-block-height (get grace-period-end proof)) ERR_INHERITANCE_NOT_DUE)
    (asserts! (is-eq (get status vault) STATUS_ACTIVE) ERR_INHERITANCE_ALREADY_TRIGGERED)
    
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { status: STATUS_INHERITANCE_TRIGGERED }))
    
    (map-set inheritance-executions
      { vault-id: vault-id }
      {
        triggered-at: stacks-block-height,
        triggered-by: tx-sender,
        execution-status: STATUS_PENDING,
        beneficiary-claims: (list),
        total-fees: u0,
        completion-percentage: u0
      })
    
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof { status: STATUS_EXPIRED }))
    
    (print {
      event: "inheritance-triggered",
      vault-id: vault-id,
      triggered-by: tx-sender,
      triggered-at: stacks-block-height,
      vault-owner: (get owner vault)
    })
    
    (ok true)))

(define-public (claim-inheritance 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (beneficiary (unwrap! (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index }) ERR_INVALID_BENEFICIARY))
    (execution (unwrap! (map-get? inheritance-executions { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get status vault) STATUS_INHERITANCE_TRIGGERED) (err u110))
    (asserts! (is-eq (get beneficiary-address beneficiary) tx-sender) ERR_UNAUTHORIZED)
    
    (let ((inheritance-amount (/ (* (get total-btc-value vault) (get allocation-percentage beneficiary)) u10000)))
      
      (print {
        event: "inheritance-claimed",
        vault-id: vault-id,
        beneficiary: tx-sender,
        beneficiary-index: beneficiary-index,
        amount: inheritance-amount,
        stacks-block-height: stacks-block-height
      })
      
      (ok inheritance-amount))))

(define-public (grant-professional-access
  (vault-id (string-utf8 36))
  (advisor principal)
  (access-level uint))
  
  (let ((vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (and (>= access-level u1) (<= access-level u3)) (err u111))
    
    (map-set professional-access
      { vault-id: vault-id, advisor: advisor }
      {
        access-level: access-level,
        granted-at: stacks-block-height,
        granted-by: tx-sender,
        active: true
      })
    
    (print {
      event: "professional-access-granted",
      vault-id: vault-id,
      advisor: advisor,
      access-level: access-level,
      granted-by: tx-sender
    })
    
    (ok true)))

(define-read-only (get-vault (vault-id (string-utf8 36)))
  (map-get? inheritance-vaults { vault-id: vault-id }))

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
    proof (>= stacks-block-height (get grace-period-end proof))
    false))

(define-read-only (get-total-vaults)
  (var-get total-vaults))

(define-read-only (get-contract-version)
  (var-get contract-version))

(define-read-only (get-professional-access
  (vault-id (string-utf8 36))
  (advisor principal))
  (map-get? professional-access { vault-id: vault-id, advisor: advisor }))

(define-public (set-inheritance-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= new-fee u1000) (err u112))
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
(var-set contract-version u1)
(var-set total-vaults u0)
(var-set inheritance-fee u100)