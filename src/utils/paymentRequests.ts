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
  created_at?: string;
  paymentRequestCreatedAt?: string;
};

export type PaymentRequest = {
  id: number;
  eventId: number;
  type: "event" | "meal" | "ride";
  sourceId?: number | null;
  amount: number;
  comment?: string | null;
  created_at?: string;
  recipients: PaymentRequestRecipient[];
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
          paymentRequestCreatedAt: paymentRequest.created_at,
        })),
    );
}

export function formatCents(amount: number) {
  return `${(amount / 100).toFixed(2)} €`;
}

type VisibleCharge = {
  assignmentId: number;
  paid: number;
  remainingAmount: number;
};

function paymentAssignmentTime(assignment: PaymentRequestRecipient) {
  return new Date(
    assignment.paymentRequestCreatedAt ?? assignment.created_at ?? "",
  ).getTime();
}

export function getVisiblePaymentAssignmentAmounts(
  assignments: PaymentRequestRecipient[],
) {
  const visibleCharges: VisibleCharge[] = [];

  const activeAssignments = [...assignments]
    .filter((assignment) => !assignment.cancelledAt)
    .sort((a, b) => {
      const aTime = paymentAssignmentTime(a);
      const bTime = paymentAssignmentTime(b);

      if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
        return aTime - bTime;
      }

      return a.id - b.id;
    });

  activeAssignments.forEach((assignment) => {
    const amount = assignment.amount ?? 0;

    if (amount > 0 && (assignment.paid === 0 || assignment.paid === 1)) {
      visibleCharges.push({
        assignmentId: assignment.id,
        paid: assignment.paid,
        remainingAmount: amount,
      });
      return;
    }

    if (amount >= 0 || assignment.paid !== 2) {
      return;
    }

    let remainingCredit = Math.abs(amount);

    for (let i = visibleCharges.length - 1; i >= 0; i -= 1) {
      if (remainingCredit <= 0) {
        break;
      }

      const appliedCredit = Math.min(
        visibleCharges[i].remainingAmount,
        remainingCredit,
      );
      visibleCharges[i].remainingAmount -= appliedCredit;
      remainingCredit -= appliedCredit;
    }
  });

  const visibleAmounts = visibleCharges.reduce(
    (acc, charge) => {
      acc.remainingByAssignmentId[charge.assignmentId] = charge.remainingAmount;

      if (charge.paid === 0) {
        acc.unpaidAmount += charge.remainingAmount;
      } else if (charge.paid === 1) {
        acc.awaitingConfirmationAmount += charge.remainingAmount;
      }

      return acc;
    },
    {
      unpaidAmount: 0,
      awaitingConfirmationAmount: 0,
      remainingByAssignmentId: {} as Record<number, number>,
    },
  );

  return {
    ...visibleAmounts,
    hasActiveAssignments: activeAssignments.length > 0,
  };
}

export function getVisiblePaymentAssignmentState(
  assignments: PaymentRequestRecipient[],
) {
  const visibleAmounts = getVisiblePaymentAssignmentAmounts(assignments);

  if (visibleAmounts.unpaidAmount > 0) {
    return 0;
  }

  if (visibleAmounts.awaitingConfirmationAmount > 0) {
    return 1;
  }

  if (visibleAmounts.hasActiveAssignments) {
    return 2;
  }

  return null;
}

export function getVisiblePositivePaymentAssignmentIds(
  assignments: PaymentRequestRecipient[],
  predicate: (assignment: PaymentRequestRecipient) => boolean,
) {
  const visibleAmounts = getVisiblePaymentAssignmentAmounts(assignments);

  return assignments
    .filter(
      (assignment) =>
        !assignment.cancelledAt &&
        (assignment.amount ?? 0) > 0 &&
        (visibleAmounts.remainingByAssignmentId[assignment.id] ?? 0) > 0 &&
        predicate(assignment),
    )
    .map((assignment) => assignment.id);
}
