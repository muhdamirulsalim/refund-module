export type ItemStatus = 'paid' | 'refunded'

export type DeliveryFeeStatus = 'paid' | 'refunded'

export interface Addon {
  addon_id: string
  name: string
  unit_price: number
  status: ItemStatus
}

export interface OrderUnit {
  unit_id: string
  status: ItemStatus
  addons: Addon[]
}

export interface OrderLine {
  line_id: string
  name: string
  unit_price: number
  units: OrderUnit[]
}

export interface Order {
  order_id: string
  status: string
  currency: string
  delivery_fee: number
  delivery_fee_status: DeliveryFeeStatus
  items: OrderLine[]
}

export interface RefundSelection {
  units: Record<string, boolean>
  addons: Record<string, boolean>
  includeDeliveryFee: boolean
}

export type RefundReason =
  | 'wrong_item'
  | 'missing_item'
  | 'quality_issue'
  | 'late_delivery'
  | 'other'

export type RefundChannel = 'original_payment' | 'in_app_credit'

export interface RefundLineSelection {
  unit_id: string
  addon_ids: string[]
}

export interface RefundPayload {
  order_id: string
  lines: RefundLineSelection[]
  include_delivery_fee: boolean
  reason: RefundReason
  channel: RefundChannel
  amount: number
}
