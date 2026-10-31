import { describe, expect, it } from 'vitest'
import initialOrder from '../data/order.json'
import {
  calculateRefundTotal,
  hasRefundSelection,
  isAddonRefundable,
  isUnitRefundable,
} from '../utils/refundCalculation'
import type { Order, RefundSelection } from '../types/order'

const order = initialOrder as Order

const emptySelection: RefundSelection = {
  units: {},
  addons: {},
  includeDeliveryFee: false,
}

describe('refundCalculation', () => {
  it('returns zero when nothing is selected', () => {
    expect(calculateRefundTotal(order, emptySelection)).toBe(0)
    expect(hasRefundSelection(order, emptySelection)).toBe(false)
  })

  it('sums unit price and selected add-ons', () => {
    const selection: RefundSelection = {
      units: { 'L1-2': true },
      addons: { 'L1-2:A1': true },
      includeDeliveryFee: false,
    }

    expect(calculateRefundTotal(order, selection)).toBe(15.9)
  })

  it('includes delivery fee when opted in', () => {
    const selection: RefundSelection = {
      units: { 'L3-1': true },
      addons: {},
      includeDeliveryFee: true,
    }

    expect(calculateRefundTotal(order, selection)).toBe(12.9)
  })

  it('supports partial add-on refund for a selected unit', () => {
    const selection: RefundSelection = {
      units: { 'L2-1': true },
      addons: { 'L2-1:A2': true },
      includeDeliveryFee: false,
    }

    expect(calculateRefundTotal(order, selection)).toBe(13.4)
  })

  it('ignores already-refunded add-ons even if selected', () => {
    const selection: RefundSelection = {
      units: { 'L1-1': true },
      addons: { 'L1-1:A1': true },
      includeDeliveryFee: false,
    }

    expect(calculateRefundTotal(order, selection)).toBe(0)
  })

  it('marks non-refundable units and add-ons', () => {
    const refundedUnit = order.items[0].units[0]
    const paidUnit = order.items[0].units[1]

    expect(isUnitRefundable(refundedUnit)).toBe(false)
    expect(isUnitRefundable(paidUnit)).toBe(true)
    expect(isAddonRefundable(refundedUnit, 'A1')).toBe(false)
    expect(isAddonRefundable(paidUnit, 'A1')).toBe(true)

    const oddUnit = order.items[1].units[1]
    expect(isUnitRefundable(oddUnit)).toBe(false)
    expect(isAddonRefundable(oddUnit, 'A2')).toBe(false)
  })
})
