;; tracking contract

(define-map tracking-events
  { product-id: uint, event-id: uint }
  {
    location: (string-ascii 100),
    timestamp: uint,
    handler: principal
  }
)

(define-map product-event-count
  { product-id: uint }
  { count: uint }
)

(define-public (add-tracking-event (product-id uint) (location (string-ascii 100)))
  (let
    (
      (event-count (default-to { count: u0 } (map-get? product-event-count { product-id: product-id })))
      (new-event-id (get count event-count))
    )
    (map-set tracking-events
      { product-id: product-id, event-id: new-event-id }
      {
        location: location,
        timestamp: block-height,
        handler: tx-sender
      }
    )
    (map-set product-event-count
      { product-id: product-id }
      { count: (+ new-event-id u1) }
    )
    (ok new-event-id)
  )
)

(define-read-only (get-tracking-event (product-id uint) (event-id uint))
  (map-get? tracking-events { product-id: product-id, event-id: event-id })
)

(define-read-only (get-latest-tracking-event (product-id uint))
  (let
    (
      (event-count (default-to { count: u0 } (map-get? product-event-count { product-id: product-id })))
    )
    (map-get? tracking-events { product-id: product-id, event-id: (- (get count event-count) u1) })
  )
)

