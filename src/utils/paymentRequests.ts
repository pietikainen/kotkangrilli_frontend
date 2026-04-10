export type PaymentRequestRecipient = {
  id: number;
  paymentRequestId: number;
  userId: number;
  paid: number;
  cancelledAt?: string | null;
  cancelledBy?: number | null;
  amount?: number;
  comment?: string | null;
  type?: "event" | "meal" | "ride";
  sourceId?: number | null;
};

export type PaymentRequest = {
  id: number;
  eventId: number;
  type: "event" | "meal" | "ride";
  sourceId?: number | null;
  amount: number;
  comment?: string | null;
  recipients: PaymentRequestRecipient[];
};

export type PaymentAssignmentSummary = {
  assignments: PaymentRequestRecipient[];
  totalAmount: number;
  unpaidAmount: number;
  awaitingConfirmationAmount: number;
  confirmedAmount: number;
  outstandingAmount: number;
  confirmedCreditAmount: number;
};

export function getScopedPaymentAssignments({
  paymentRequests,
  type,
  sourceId,
  userId,
}: {
  paymentRequests?: PaymentRequest[];
  type: "event" | "meal" | "ride";
  sourceId?: number | null;
  userId: number;
}): PaymentRequestRecipient[] {
  return (paymentRequests ?? [])
    .filter((paymentRequest) => {
      if (paymentRequest.type !== type) {
        return false;
      }

      if (type === "event") {
        return true;
      }

      return paymentRequest.sourceId === sourceId;
    })
    .flatMap((paymentRequest) =>
      (paymentRequest.recipients ?? [])
        .filter((recipient) => recipient.userId === userId)
        .map((recipient) => ({
          ...recipient,
          amount: paymentRequest.amount,
          comment: paymentRequest.comment,
          type: paymentRequest.type,
          sourceId: paymentRequest.sourceId ?? null,
        })),
    );
}

export function summarizePaymentAssignments(
  assignments: PaymentRequestRecipient[],
): PaymentAssignmentSummary {
  return assignments.reduce(
    (acc, assignment) => {
      if (assignment.cancelledAt) {
        return acc;
      }

      const amount = assignment.amount ?? 0;
      acc.totalAmount += amount;

      if (assignment.paid === 0) {
        acc.unpaidAmount += amount;
        acc.outstandingAmount += amount;
      } else if (assignment.paid === 1) {
        acc.awaitingConfirmationAmount += amount;
        acc.outstandingAmount += amount;
      } else if (assignment.paid === 2) {
        acc.confirmedAmount += amount;
        if (amount < 0) {
          acc.confirmedCreditAmount += Math.abs(amount);
          acc.outstandingAmount += amount;
        }
      }

      return acc;
    },
    {
      assignments,
      totalAmount: 0,
      unpaidAmount: 0,
      awaitingConfirmationAmount: 0,
      confirmedAmount: 0,
      outstandingAmount: 0,
      confirmedCreditAmount: 0,
    },
  );
}

export function formatCents(amount: number) {
  return `${(amount / 100).toFixed(2)} €`;
}

export function getDisplayBalances(summary: PaymentAssignmentSummary) {
  let remainingCredit = summary.confirmedCreditAmount;

  const unpaidAmount = Math.max(0, summary.unpaidAmount - remainingCredit);
  remainingCredit = Math.max(0, remainingCredit - summary.unpaidAmount);

  const awaitingConfirmationAmount = Math.max(
    0,
    summary.awaitingConfirmationAmount - remainingCredit,
  );
  remainingCredit = Math.max(
    0,
    remainingCredit - summary.awaitingConfirmationAmount,
  );

  return {
    unpaidAmount,
    awaitingConfirmationAmount,
    remainingCreditAmount: remainingCredit,
  };
}
