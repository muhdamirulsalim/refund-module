import { useMemo, useState } from "react";
import { buildPayload, submitRefund } from "../../api/mockRefundApi";
import {
  calculateRefundTotal,
  hasRefundSelection,
} from "../../utils/refundCalculation";
import type {
  Order,
  RefundChannel,
  RefundReason,
  RefundSelection,
} from "../../types/order";
import { Modal } from "../ui/Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import { ReviewStep } from "./ReviewStep";
import { RefundTotalBar, SelectItemsStep } from "./SelectItemsStep";

interface RefundModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

const emptySelection = (): RefundSelection => ({
  units: {},
  addons: {},
  includeDeliveryFee: false,
});

export function RefundModal({ order, onClose, onSuccess }: RefundModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selection, setSelection] = useState<RefundSelection>(emptySelection);
  const [reason, setReason] = useState<RefundReason>("wrong_item");
  const [channel, setChannel] = useState<RefundChannel>("original_payment");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refundTotal = useMemo(
    () => calculateRefundTotal(order, selection),
    [order, selection],
  );

  const canProceed = useMemo(
    () => hasRefundSelection(order, selection),
    [order, selection],
  );

  const handleConfirmRefund = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = buildPayload(order, {
      ...selection,
      reason,
      channel,
      amount: refundTotal,
    });

    try {
      const updated = await submitRefund(order, payload);
      onSuccess(updated);
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Refund failed. Please retry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      {step === 1 ? (
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setStep(2)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setConfirmOpen(true);
            }}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
          >
            Confirm
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <Modal
        title={
          step === 1 ? "Refund : Select items" : "Refund : Review & details"
        }
        onClose={onClose}
        summary={
          step === 1 ? (
            <RefundTotalBar total={refundTotal} currency={order.currency} />
          ) : undefined
        }
        footer={footer}
        size="lg"
      >
        {step === 1 ? (
          <SelectItemsStep
            order={order}
            selection={selection}
            onChange={setSelection}
          />
        ) : (
          <ReviewStep
            order={order}
            selection={selection}
            reason={reason}
            channel={channel}
            onReasonChange={setReason}
            onChannelChange={setChannel}
          />
        )}
      </Modal>

      {confirmOpen ? (
        <ConfirmDialog
          amount={refundTotal}
          currency={order.currency}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          onCancel={() => {
            if (!isSubmitting) {
              setConfirmOpen(false);
              setErrorMessage(null);
            }
          }}
          onConfirm={() => {
            void handleConfirmRefund();
          }}
        />
      ) : null}
    </>
  );
}
