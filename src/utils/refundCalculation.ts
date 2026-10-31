import { addonSelectionKey } from './addonKey'
import type { Order, OrderUnit, RefundSelection } from '../types/order'

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function isUnitRefundable(unit: OrderUnit): boolean {
  return unit.status !== 'refunded'
}

export function isAddonRefundable(unit: OrderUnit, addonId: string): boolean {
  if (!isUnitRefundable(unit)) {
    return false
  }

  const addon = unit.addons.find((entry) => entry.addon_id === addonId)
  return addon !== undefined && addon.status !== 'refunded'
}

export function calculateRefundTotal(
  order: Order,
  selection: RefundSelection,
): number {
  let total = 0

  for (const line of order.items) {
    for (const unit of line.units) {
      if (!selection.units[unit.unit_id] || !isUnitRefundable(unit)) {
        continue
      }

      total += line.unit_price

      for (const addon of unit.addons) {
        const key = addonSelectionKey(unit.unit_id, addon.addon_id)
        if (selection.addons[key] && addon.status !== 'refunded') {
          total += addon.unit_price
        }
      }
    }
  }

  if (selection.includeDeliveryFee && order.delivery_fee_status === 'paid') {
    total += order.delivery_fee
  }

  return roundMoney(total)
}

export function hasRefundSelection(
  order: Order,
  selection: RefundSelection,
): boolean {
  return calculateRefundTotal(order, selection) > 0
}

export function buildRefundPreview(
  order: Order,
  selection: RefundSelection,
): { label: string; amount: number }[] {
  const rows: { label: string; amount: number }[] = []

  for (const line of order.items) {
    for (const unit of line.units) {
      if (!selection.units[unit.unit_id] || !isUnitRefundable(unit)) {
        continue
      }

      rows.push({
        label: `${line.name} (${unit.unit_id})`,
        amount: line.unit_price,
      })

      for (const addon of unit.addons) {
        const key = addonSelectionKey(unit.unit_id, addon.addon_id)
        if (selection.addons[key] && isAddonRefundable(unit, addon.addon_id)) {
          rows.push({
            label: `  + ${addon.name}`,
            amount: addon.unit_price,
          })
        }
      }
    }
  }

  if (selection.includeDeliveryFee && order.delivery_fee_status === 'paid') {
    rows.push({ label: 'Delivery fee', amount: order.delivery_fee })
  }

  return rows
}
