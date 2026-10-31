import { formatCurrency } from '../../utils/formatCurrency'

interface ConfirmDialogProps {
  amount: number
  currency: string
  isSubmitting: boolean
  errorMessage: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  amount,
  currency,
  isSubmitting,
  errorMessage,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
      >
        <h3 id="confirm-title" className="text-lg font-semibold text-slate-900">
          Confirm refund?
        </h3>
        <p id="confirm-description" className="mt-2 text-sm text-slate-600">
          You are about to refund{' '}
          <strong>{formatCurrency(amount, currency)}</strong> to the customer.
          This action cannot be undone from this screen.
        </p>

        {errorMessage ? (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Confirm refund'}
          </button>
        </div>
      </div>
    </div>
  )
}
