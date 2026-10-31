import type { Order, RefundPayload } from '../types/order'

const MIN_DELAY_MS = 900
const MAX_DELAY_MS = 2200
const FAILURE_RATE = 0.12

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function randomDelay(): Promise<void> {
  const ms =
    MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS))
  return delay(ms)
}

function cloneOrder(order: Order): Order {
  return structuredClone(order)
}

export function applyRefundToOrder(order: Order, payload: RefundPayload): Order {
  const next = cloneOrder(order)

  for (const line of payload.lines) {
    for (const itemLine of next.items) {
      const unit = itemLine.units.find((entry) => entry.unit_id === line.unit_id)
      if (!unit) {
        continue
      }

      unit.status = 'refunded'

      for (const addonId of line.addon_ids) {
        const addon = unit.addons.find((entry) => entry.addon_id === addonId)
        if (addon) {
          addon.status = 'refunded'
        }
      }
    }
  }

  if (payload.include_delivery_fee) {
    next.delivery_fee_status = 'refunded'
  }

  return next
}

export function buildPayload(
  order: Order,
  selection: {
    units: Record<string, boolean>
    addons: Record<string, boolean>
    includeDeliveryFee: boolean
    reason: RefundPayload['reason']
    channel: RefundPayload['channel']
    amount: number
  },
): RefundPayload {
  const lines = Object.entries(selection.units)
    .filter(([, selected]) => selected)
    .map(([unitId]) => {
      const addonIds = Object.entries(selection.addons)
        .filter(([key, selected]) => selected && key.startsWith(`${unitId}:`))
        .map(([key]) => key.split(':')[1])

      return { unit_id: unitId, addon_ids: addonIds }
    })

  return {
    order_id: order.order_id,
    lines,
    include_delivery_fee: selection.includeDeliveryFee,
    reason: selection.reason,
    channel: selection.channel,
    amount: selection.amount,
  }
}

export async function submitRefund(
  order: Order,
  payload: RefundPayload,
): Promise<Order> {
  await randomDelay()

  if (Math.random() < FAILURE_RATE) {
    throw new Error(
      'The refund service is temporarily unavailable. Please try again.',
    )
  }

  if (payload.amount <= 0) {
    throw new Error('Refund amount must be greater than zero.')
  }

  return applyRefundToOrder(order, payload)
}
