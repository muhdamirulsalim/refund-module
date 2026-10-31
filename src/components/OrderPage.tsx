import { formatCurrency } from "../utils/formatCurrency";
import type { Order, OrderLine, OrderUnit } from "../types/order";

interface OrderPageProps {
  order: Order;
  onStartRefund: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const isRefunded = status === "refunded";
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        isRefunded
          ? "bg-slate-200 text-slate-600"
          : "bg-emerald-100 text-emerald-800"
      }`}
    >
      {isRefunded ? "Refunded" : "Paid"}
    </span>
  );
}

function UnitRow({
  line,
  unit,
  currency,
}: {
  line: OrderLine;
  unit: OrderUnit;
  currency: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{line.name}</p>
          <p className="text-xs text-slate-500">Unit {unit.unit_id}</p>
        </div>
        <div className="text-right">
          <p className="font-medium text-slate-900">
            {formatCurrency(line.unit_price, currency)}
          </p>
          <StatusBadge status={unit.status} />
        </div>
      </div>
      {unit.addons.length > 0 ? (
        <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {unit.addons.map((addon) => (
            <li
              key={`${unit.unit_id}-${addon.addon_id}`}
              className="flex items-center justify-between text-sm text-slate-700"
            >
              <span>+ {addon.name}</span>
              <div className="flex items-center gap-2">
                <span>{formatCurrency(addon.unit_price, currency)}</span>
                <StatusBadge status={addon.status} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function OrderPage({ order, onStartRefund }: OrderPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Orders
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            Order No: {order.order_id}
          </h1>
          <p className="mt-1 text-sm text-slate-600 capitalize">
            Status: {order.status}
          </p>
        </div>
        <button
          type="button"
          onClick={onStartRefund}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover"
        >
          Refund
        </button>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Items
        </h2>
        {order.items.flatMap((line) =>
          line.units.map((unit) => (
            <UnitRow
              key={unit.unit_id}
              line={line}
              unit={unit}
              currency={order.currency}
            />
          )),
        )}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Delivery fee</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">
              {formatCurrency(order.delivery_fee, order.currency)}
            </span>
            <StatusBadge status={order.delivery_fee_status} />
          </div>
        </div>
      </section>
    </div>
  );
}
