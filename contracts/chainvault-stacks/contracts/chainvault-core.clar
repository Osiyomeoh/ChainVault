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
(define-data-var total-vaults uint u0)
(define-data-var inheritance-fee uint u100)

;; Enhanced vault storage with privacy and encryption
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
    grace-period: uint,
    vault-name: (string-utf8 50),
    total-btc-value: uint
  }
)

;; Beneficiary allocations
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

;; Enhanced proof of life with grace periods
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

;; Create enhanced vault with privacy features
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
        created-at: block-height,
        last-activity: block-height,
        inheritance-delay: inheritance-delay,
        status: "active",
        privacy-level: privacy-level,
        bitcoin-addresses-hash: bitcoin-addresses-hash,
        beneficiaries-hash: beneficiaries-hash,
        grace-period: grace-period,
        vault-name: vault-name,
        total-btc-value: u0
      })
    (map-set proof-of-life
      { vault-id: vault-id }
      {
        last-checkin: block-height,
        next-deadline: (+ block-height inheritance-delay),
        reminder-count: u0,
        grace-period-end: (+ block-height inheritance-delay grace-period),
        status: "active"
      })
    (var-set total-vaults (+ (var-get total-vaults) u1))
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

;; Update proof of life (enhanced with grace period)
(define-public (update-proof-of-life (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { 
        last-activity: block-height,
        status: "active"
      }))
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof {
        last-checkin: block-height,
        next-deadline: (+ block-height (get inheritance-delay vault)),
        reminder-count: u0,
        grace-period-end: (+ block-height (get inheritance-delay vault) (get grace-period vault)),
        status: "active"
      }))
    (print {
      event: "proof-of-life-updated",
      vault-id: vault-id,
      owner: tx-sender,
      next-deadline: (+ block-height (get inheritance-delay vault)),
      block-height: block-height
    })
    
    (ok true)))

;; Trigger inheritance (with grace period)
(define-public (trigger-inheritance (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    (asserts! (>= block-height (get grace-period-end proof)) ERR_INHERITANCE_NOT_DUE)
    (asserts! (is-eq (get status vault) "active") ERR_INHERITANCE_ALREADY_TRIGGERED)
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { status: "inheritance-triggered" }))
    (map-set proof-of-life
      { vault-id: vault-id }
      (merge proof { status: "expired" }))
    (print {
      event: "inheritance-triggered",
      vault-id: vault-id,
      triggered-by: tx-sender,
      triggered-at: block-height,
      vault-owner: (get owner vault)
    })
    
    (ok true)))

;; Basic inheritance claim (simplified)
(define-public (claim-inheritance 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (beneficiary (unwrap! (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index }) ERR_INVALID_BENEFICIARY)))
    (asserts! (is-eq (get status vault) "inheritance-triggered") (err u110))
    (asserts! (is-eq (get beneficiary-address beneficiary) tx-sender) ERR_UNAUTHORIZED)
        (let ((inheritance-amount (/ (* (get total-btc-value vault) (get allocation-percentage beneficiary)) u10000)))
      (print {
        event: "inheritance-claimed",
        vault-id: vault-id,
        beneficiary: tx-sender,
        beneficiary-index: beneficiary-index,
        amount: inheritance-amount,
        block-height: block-height
      })
      
      (ok inheritance-amount))))

;; Read-only functions
(define-read-only (get-vault (vault-id (string-utf8 36)))
  (map-get? inheritance-vaults { vault-id: vault-id }))

(define-read-only (get-proof-of-life (vault-id (string-utf8 36)))
  (map-get? proof-of-life { vault-id: vault-id }))

(define-read-only (get-beneficiary 
  (vault-id (string-utf8 36))
  (beneficiary-index uint))
  (map-get? vault-beneficiaries { vault-id: vault-id, beneficiary-index: beneficiary-index }))

(define-read-only (is-inheritance-due (vault-id (string-utf8 36)))
  (match (map-get? proof-of-life { vault-id: vault-id })
    proof (>= block-height (get grace-period-end proof))
    false))

(define-read-only (get-total-vaults)
  (var-get total-vaults))

;; Administrative function
(define-public (set-inheritance-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (<= new-fee u1000) (err u112))
    (var-set inheritance-fee new-fee)
    (ok true)))