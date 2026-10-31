# Refund Module (ZUS Technical Assessment)

React + TypeScript back-office refund flow for partial and full order refunds

## Run locally

npm install
npm run dev

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Tests

npm test

## Build

npm run build
npm run preview

---

### a) API endpoints

**GET `/orders/:orderId`**

Returns the current order snapshot (items, per-unit status, add-ons, delivery fee).

```json
{
  "order_id": "ORD-10482",
  "status": "completed",
  "currency": "MYR",
  "delivery_fee": 5.0,
  "delivery_fee_status": "paid",
  "items": [
    /* ... */
  ]
}
```

**POST `/orders/:orderId/refunds`**

Creates a refund against selected units/add-ons.

Request:

```json
{
  "lines": [{ "unit_id": "L1-2", "addon_ids": ["A1"] }],
  "include_delivery_fee": false,
  "reason": "quality_issue",
  "channel": "original_payment",
  "amount": 15.9
}
```

Response `201`:

```json
{
  "refund_id": "RF-9081",
  "order_id": "ORD-10482",
  "amount": 15.9,
  "currency": "MYR",
  "status": "succeeded",
  "order": {
    /* updated order after refund list */
  }
}
```

Error `4xx/5xx`:

```json
{
  "error": "REFUND_REJECTED",
  "message": "Human-readable reason"
}
```

The mock in `src/api/mockRefundApi.ts` simulates latency (~0.9–2.2s) and occasional failures (~12%).

### b) Refund calculation

The UI calculates totals on the client for instant feedback in step 1 and step 2. **The backend must recalculate and authorize the final amount** on submit using the same pricing rules; the client `amount` is a hint, not the source of truth.

To keep them aligned:

- Share one calculation module (or duplicate with contract tests) between frontend and backend.
- Server validates each `unit_id` / `addon_id` is refundable, applies tax/promo rules if any, and rejects mismatched totals.
- Return the authoritative `amount` in the refund response; the UI should refresh order state from the server after success.

### c) Assumptions, questions & comments

- L2-2 add-ons marked `paid` while the unit is `refunded`: Treated as not refundable in isolation (main item rule). Assumed data inconsistency from a prior partial migration; would confirm with PM/data team.
- Full refund: Interpreted as selecting every remaining refundable unit (with chosen add-ons) and optionally the delivery fee—not a separate one-click control.
- Tax / discounts / tips: Not in sample data, assume the final products prices are tax inclusive.

### d) Key decisions & trade-offs

- **Per-unit rows** mirror ops mental model and match the spec when quantity > 1.
- **Pure functions** in `refundCalculation.ts` keep UI and tests simple and portable to a future API layer.
- **Modal wizard** (select → review → confirm) matches the brief; confirm is a nested dialog so cancel only dismisses confirmation.

### e) Known limitations & next steps

- No persistent storage (in-memory mock only); refresh resets the order.
- No refund list, idempotency keys, or optimistic locking for concurrent staff.
- Would wire real API client, error toasts, and loading skeletons on the order page.
