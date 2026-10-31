import { formatCurrency } from "../../utils/formatCurrency";
import {
  buildRefundPreview,
  calculateRefundTotal,
} from "../../utils/refundCalculation";
import type {
  Order,
  RefundChannel,
  RefundReason,
  RefundSelection,
} from "../../types/order";

const REASON_OPTIONS: { value: RefundReason; label: string }[] = [
  { value: "wrong_item", label: "Wrong item" },
  { value: "missing_item", label: "Missing item" },
  { value: "quality_issue", label: "Quality issue" },
  { value: "late_delivery", label: "Late delivery" },
  { value: "other", label: "Other" },
];

const CHANNEL_OPTIONS: { value: RefundChannel; label: string }[] = [
  { value: "original_payment", label: "Original payment method" },
  { value: "in_app_credit", label: "In-app credit" },
];

interface ReviewStepProps {
  order: Order;
  selection: RefundSelection;
  reason: RefundReason;
  channel: RefundChannel;
  onReasonChange: (reason: RefundReason) => void;
  onChannelChange: (channel: RefundChannel) => void;
}

export function ReviewStep({
  order,
  selection,
  reason,
  channel,
  onReasonChange,
  onChannelChange,
}: ReviewStepProps) {
  const preview = buildRefundPreview(order, selection);
  const total = calculateRefundTotal(order, selection);

  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Refund preview
        </h3>
        <ul className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          {preview.map((row) => (
            <li
              key={`${row.label}-${row.amount}`}
              className="flex justify-between gap-4"
            >
              <span className="text-slate-700">{row.label}</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(row.amount, order.currency)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between text-base font-semibold text-slate-900">
          <span>Final refund amount</span>
          <span>{formatCurrency(total, order.currency)}</span>
        </div>
      </section>

      <section className="space-y-2">
        <label
          htmlFor="refund-reason"
          className="text-sm font-medium text-slate-800"
        >
          Reason
        </label>
        <div className="relative">
          <select
            id="refund-reason"
            value={reason}
            onChange={(event) =>
              onReasonChange(event.target.value as RefundReason)
            }
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-900"
          >
            {REASON_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500"
            aria-hidden
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </section>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-800">Channel</legend>
        <div className="space-y-2">
          {CHANNEL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-brand-muted"
            >
              <input
                type="radio"
                name="refund-channel"
                value={option.value}
                checked={channel === option.value}
                onChange={() => onChannelChange(option.value)}
                className="accent-brand"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
