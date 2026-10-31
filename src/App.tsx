import { useState } from 'react'
import initialOrder from './data/order.json'
import { AppHeader } from './components/AppHeader'
import { OrderPage } from './components/OrderPage'
import { RefundModal } from './components/refund/RefundModal'
import type { Order } from './types/order'

function App() {
  const [order, setOrder] = useState<Order>(initialOrder as Order)
  const [refundOpen, setRefundOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <AppHeader />
      <OrderPage order={order} onStartRefund={() => setRefundOpen(true)} />
      {refundOpen ? (
        <RefundModal
          order={order}
          onClose={() => setRefundOpen(false)}
          onSuccess={(updated) => {
            setOrder(updated)
            setRefundOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

export default App
