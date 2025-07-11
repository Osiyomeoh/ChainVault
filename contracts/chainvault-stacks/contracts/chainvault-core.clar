;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_VAULT_NOT_FOUND (err u101))
(define-constant ERR_VAULT_ALREADY_EXISTS (err u102))
(define-constant ERR_INHERITANCE_NOT_DUE (err u104))
(define-constant ERR_INHERITANCE_ALREADY_TRIGGERED (err u105))

;; Data Variables
(define-data-var total-vaults uint u0)

;; Core vault storage - simplified version
(define-map inheritance-vaults
  { vault-id: (string-utf8 36) }
  {
    owner: principal,
    created-at: uint,
    last-activity: uint,
    inheritance-delay: uint,
    status: (string-utf8 20),
    vault-name: (string-utf8 50)
  }
)

;; Proof of life tracking
(define-map proof-of-life
  { vault-id: (string-utf8 36) }
  {
    last-checkin: uint,
    next-deadline: uint,
    status: (string-utf8 20)
  }
)

;; Create a basic inheritance vault
(define-public (create-vault
  (vault-id (string-utf8 36))
  (vault-name (string-utf8 50))
  (inheritance-delay uint))
  
  (let ((vault-exists (is-some (map-get? inheritance-vaults { vault-id: vault-id }))))
    
    ;; Validate inputs
    (asserts! (not vault-exists) ERR_VAULT_ALREADY_EXISTS)
    (asserts! (> inheritance-delay u0) (err u107))
    
    ;; Create vault record
    (map-set inheritance-vaults
      { vault-id: vault-id }
      {
        owner: tx-sender,
        created-at: block-height,
        last-activity: block-height,
        inheritance-delay: inheritance-delay,
        status: "active",
        vault-name: vault-name
      })
    
    ;; Initialize proof of life
    (map-set proof-of-life
      { vault-id: vault-id }
      {
        last-checkin: block-height,
        next-deadline: (+ block-height inheritance-delay),
        status: "active"
      })
    
    ;; Update total vaults counter
    (var-set total-vaults (+ (var-get total-vaults) u1))
    
    ;; Emit event
    (print {
      event: "vault-created",
      vault-id: vault-id,
      owner: tx-sender,
      block-height: block-height
    })
    
    (ok vault-id)))

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

;; Trigger inheritance (basic version)
(define-public (trigger-inheritance (vault-id (string-utf8 36)))
  (let (
    (vault (unwrap! (map-get? inheritance-vaults { vault-id: vault-id }) ERR_VAULT_NOT_FOUND))
    (proof (unwrap! (map-get? proof-of-life { vault-id: vault-id }) ERR_VAULT_NOT_FOUND)))
    
    ;; Check if inheritance is due
    (asserts! (>= block-height (get next-deadline proof)) ERR_INHERITANCE_NOT_DUE)
    
    ;; Check if not already triggered
    (asserts! (is-eq (get status vault) "active") ERR_INHERITANCE_ALREADY_TRIGGERED)
    
    ;; Update vault status
    (map-set inheritance-vaults
      { vault-id: vault-id }
      (merge vault { status: "inheritance-triggered" }))
    
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

;; Read-only functions
(define-read-only (get-vault (vault-id (string-utf8 36)))
  (map-get? inheritance-vaults { vault-id: vault-id }))

(define-read-only (get-proof-of-life (vault-id (string-utf8 36)))
  (map-get? proof-of-life { vault-id: vault-id }))

(define-read-only (is-inheritance-due (vault-id (string-utf8 36)))
  (match (map-get? proof-of-life { vault-id: vault-id })
    proof (>= block-height (get next-deadline proof))
    false))

(define-read-only (get-total-vaults)
  (var-get total-vaults))