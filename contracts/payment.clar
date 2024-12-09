;; payment contract

(define-map payments
  { payment-id: uint }
  {
    product-id: uint,
    amount: uint,
    recipient: principal,
    paid: bool
  }
)

(define-data-var next-payment-id uint u0)

(define-public (create-payment (product-id uint) (amount uint) (recipient principal))
  (let
    (
      (payment-id (var-get next-payment-id))
    )
    (map-set payments
      { payment-id: payment-id }
      {
        product-id: product-id,
        amount: amount,
        recipient: recipient,
        paid: false
      }
    )
    (var-set next-payment-id (+ payment-id u1))
    (ok payment-id)
  )
)

(define-public (make-payment (payment-id uint))
  (let
    (
      (payment (unwrap! (map-get? payments { payment-id: payment-id }) (err u404)))
    )
    (asserts! (not (get paid payment)) (err u403))
    (try! (stx-transfer? (get amount payment) tx-sender (get recipient payment)))
    (map-set payments
      { payment-id: payment-id }
      (merge payment { paid: true })
    )
    (ok true)
  )
)

(define-read-only (get-payment (payment-id uint))
  (map-get? payments { payment-id: payment-id })
)

