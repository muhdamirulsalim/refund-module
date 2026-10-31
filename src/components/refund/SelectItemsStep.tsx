import { addonSelectionKey } from '../../utils/addonKey'
import { formatCurrency } from '../../utils/formatCurrency'
import { isAddonRefundable, isUnitRefundable } from '../../utils/refundCalculation'
import type { Order, OrderUnit, RefundSelection } from '../../types/order'

interface SelectItemsStepProps {
  order: Order
  selection: RefundSelection
  onChange: (selection: RefundSelection) => void
}

function toggleUnit(
  selection: RefundSelection,
  unit: OrderUnit,
  checked: boolean,
): RefundSelection {
  const units = { ...selection.units, [unit.unit_id]: checked }
  const addons = { ...selection.addons }

  if (!checked) {
    for (const addon of unit.addons) {
      delete addons[addonSelectionKey(unit.unit_id, addon.addon_id)]
    }
    return { ...selection, units, addons }
  }

  for (const addon of unit.addons) {
    if (isAddonRefundable(unit, addon.addon_id)) {
      addons[addonSelectionKey(unit.unit_id, addon.addon_id)] = true
    }
  }

  return { ...selection, units, addons }
}

function toggleAddon(
  selection: RefundSelection,
  unitId: string,
  addonId: string,
  checked: boolean,
): RefundSelection {
  const key = addonSelectionKey(unitId, addonId)
  const addons = { ...selection.addons }

  if (checked) {
    addons[key] = true
  } else {
    delete addons[key]
  }

  return { ...selection, addons }
}

export function RefundTotalBar({
  total,
  currency,
}: {
  total: number
  currency: string
}) {
  const hasTotal = total > 0

  return (
    <div aria-live="polite" aria-atomic="true">
      <div
        className={`flex items-center justify-between gap-4 rounded-xl px-5 py-3.5 shadow-md transition-colors ${
          hasTotal
            ? 'bg-brand shadow-brand/20'
            : 'border border-slate-200 bg-slate-50'
        }`}
      >
        <div className="min-w-0">
          <p
            className={`text-xs font-semibold uppercase tracking-wider ${
              hasTotal ? 'text-white/85' : 'text-slate-500'
            }`}
          >
            Total refund
          </p>
          <p
            className={`mt-0.5 text-xs ${
              hasTotal ? 'text-white/75' : 'text-slate-400'
            }`}
          >
            {hasTotal
              ? 'Updates as you select items'
              : 'Select items or delivery fee to continue'}
          </p>
        </div>
        <p
          className={`shrink-0 text-2xl font-bold tabular-nums tracking-tight ${
            hasTotal ? 'text-white' : 'text-slate-400'
          }`}
        >
          {formatCurrency(total, currency)}
        </p>
      </div>
    </div>
  )
}

export function SelectItemsStep({
  order,
  selection,
  onChange,
}: SelectItemsStepProps) {
  const deliveryRefundable = order.delivery_fee_status === 'paid'

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Select the units and add-ons to refund. Add-ons can only be refunded
        together with their main item.
      </p>

      <div className="space-y-3">
        {order.items.flatMap((line) =>
          line.units.map((unit) => {
            const unitSelectable = isUnitRefundable(unit)
            const unitChecked = Boolean(selection.units[unit.unit_id])

            return (
              <div
                key={unit.unit_id}
                className={`rounded-lg border p-3 ${
                  unitSelectable
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-slate-100 bg-slate-50/60 opacity-70'
                }`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 accent-brand"
                    checked={unitChecked}
                    disabled={!unitSelectable}
                    onChange={(event) =>
                      onChange(
                        toggleUnit(selection, unit, event.target.checked),
                      )
                    }
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">{line.name}</p>
                        <p className="text-xs text-slate-500">Unit {unit.unit_id}</p>
                      </div>
                      <p className="font-medium text-slate-900">
                        {formatCurrency(line.unit_price, order.currency)}
                      </p>
                    </div>

                    {unit.addons.length > 0 ? (
                      <ul className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                        {unit.addons.map((addon) => {
                          const key = addonSelectionKey(unit.unit_id, addon.addon_id)
                          const addonSelectable =
                            unitChecked && isAddonRefundable(unit, addon.addon_id)
                          const addonChecked = Boolean(selection.addons[key])

                          return (
                            <li key={key}>
                              <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
                                <span className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 accent-brand"
                                    checked={addonChecked}
                                    disabled={!addonSelectable}
                                    onChange={(event) =>
                                      onChange(
                                        toggleAddon(
                                          selection,
                                          unit.unit_id,
                                          addon.addon_id,
                                          event.target.checked,
                                        ),
                                      )
                                    }
                                  />
                                  <span>+ {addon.name}</span>
                                </span>
                                <span>{formatCurrency(addon.unit_price, order.currency)}</span>
                              </label>
                            </li>
                          )
                        })}
                      </ul>
                    ) : null}

                    {!unitSelectable ? (
                      <p className="mt-2 text-xs text-slate-500">
                        Already refunded
                      </p>
                    ) : null}
                  </div>
                </label>
              </div>
            )
          }),
        )}
      </div>

      {deliveryRefundable ? (
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-3">
          <span className="flex items-center gap-3 text-sm font-medium text-slate-800">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 accent-brand"
              checked={selection.includeDeliveryFee}
              onChange={(event) =>
                onChange({
                  ...selection,
                  includeDeliveryFee: event.target.checked,
                })
              }
            />
            Refund delivery fee (optional)
          </span>
          <span>{formatCurrency(order.delivery_fee, order.currency)}</span>
        </label>
      ) : (
        <p className="text-sm text-slate-500">Delivery fee already refunded.</p>
      )}
    </div>
  )
}
