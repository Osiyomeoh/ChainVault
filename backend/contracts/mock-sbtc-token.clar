;; Mock sBTC Token Contract for ChainVault Testing
;; This implements a simple fungible token that mimics sBTC behavior

;; Define the mock sBTC fungible token
(define-fungible-token mock-sbtc)

;; Constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INSUFFICIENT_BALANCE (err u402))
(define-constant ERR_INVALID_AMOUNT (err u403))
(define-constant ERR_TRANSFER_FAILED (err u404))

;; Token metadata
(define-data-var token-name (string-ascii 32) "Mock sBTC")
(define-data-var token-symbol (string-ascii 10) "msBTC")
(define-data-var token-decimals uint u8)
(define-data-var total-supply uint u0)

;; SIP-010 compliant transfer function
(define-public (transfer 
  (amount uint) 
  (sender principal) 
  (recipient principal) 
  (memo (optional (buff 34))))
  
  (begin
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (is-eq tx-sender sender) ERR_UNAUTHORIZED)
    
    (try! (ft-transfer? mock-sbtc amount sender recipient))
    
    (print {
      event: "transfer",
      sender: sender,
      recipient: recipient,
      amount: amount,
      memo: memo
    })
    
    (ok true)))

;; Get balance of a principal
(define-read-only (get-balance (account principal))
  (ft-get-balance mock-sbtc account))

;; Get token name
(define-read-only (get-name)
  (ok (var-get token-name)))

;; Get token symbol  
(define-read-only (get-symbol)
  (ok (var-get token-symbol)))

;; Get token decimals
(define-read-only (get-decimals)
  (ok (var-get token-decimals)))

;; Get total supply
(define-read-only (get-total-supply)
  (ok (var-get total-supply)))

;; Get token URI (not implemented for mock)
(define-read-only (get-token-uri)
  (ok none))

;; Mint tokens (for testing purposes)
(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    
    (try! (ft-mint? mock-sbtc amount recipient))
    (var-set total-supply (+ (var-get total-supply) amount))
    
    (print {
      event: "mint",
      recipient: recipient,
      amount: amount,
      total-supply: (var-get total-supply)
    })
    
    (ok true)))

;; Burn tokens (for testing purposes)
(define-public (burn (amount uint) (owner principal))
  (begin
    (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_AMOUNT)
    (asserts! (>= (ft-get-balance mock-sbtc owner) amount) ERR_INSUFFICIENT_BALANCE)
    
    (try! (ft-burn? mock-sbtc amount owner))
    (var-set total-supply (- (var-get total-supply) amount))
    
    (print {
      event: "burn",
      owner: owner,
      amount: amount,
      total-supply: (var-get total-supply)
    })
    
    (ok true)))

;; Batch mint for testing setup (mint to multiple accounts)
(define-public (batch-mint (recipients (list 10 {recipient: principal, amount: uint})))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (fold mint-to-recipient recipients u0)
    (ok true)))

(define-private (mint-to-recipient 
  (recipient-data {recipient: principal, amount: uint})
  (prev-result uint))
  (begin
    (unwrap! (mint (get amount recipient-data) (get recipient recipient-data)) prev-result)
    (+ prev-result (get amount recipient-data))))

;; Initialize the contract
(begin
  (var-set token-name "Mock sBTC")
  (var-set token-symbol "msBTC") 
  (var-set token-decimals u8)
  (var-set total-supply u0))