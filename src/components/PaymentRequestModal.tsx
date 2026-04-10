import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import React, { useState } from "react";
import useCreatePaymentRequest from "../api/useCreatePaymentRequest.hook";

export default function PaymentRequestModal({
  opened,
  onClose,
  title,
  description,
  type,
  eventId,
  sourceId,
  defaultAmountCents = 0,
  userIds,
  forceNegative = false,
  submitLabel = "Luo maksu",
}: {
  opened: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type: "event" | "meal" | "ride";
  eventId?: number;
  sourceId?: number;
  defaultAmountCents?: number;
  userIds?: number[];
  forceNegative?: boolean;
  submitLabel?: string;
}) {
  const createPaymentRequest = useCreatePaymentRequest();
  const [amountEuros, setAmountEuros] = useState<string>(
    (Math.abs(defaultAmountCents) / 100).toFixed(2),
  );
  const [comment, setComment] = useState("");

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <Stack>
        {description && <Text size="sm">{description}</Text>}
        <NumberInput
          label={forceNegative ? "Hyvityksen summa euroina" : "Summa euroina"}
          decimalScale={2}
          fixedDecimalScale
          allowNegative={!forceNegative}
          value={amountEuros}
          onChange={(value) => setAmountEuros(String(value ?? ""))}
        />
        <Textarea
          label="Selite"
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
        />
        <Group>
          <Button variant="default" onClick={onClose}>
            Peruuta
          </Button>
          <Button
            onClick={() => {
              const numericEuros = Number(amountEuros);
              const normalizedEuros = forceNegative
                ? Math.abs(numericEuros)
                : numericEuros;
              const amount = Math.round(normalizedEuros * 100);

              if (!Number.isFinite(normalizedEuros) || amount === 0) {
                notifications.show({
                  title: "Virheellinen summa",
                  message: "Anna summa euroina, esimerkiksi 60 tai 12.50",
                  color: "red",
                });
                return;
              }

              createPaymentRequest.mutate(
                {
                  type,
                  eventId,
                  sourceId,
                  amount: forceNegative ? -amount : amount,
                  comment,
                  userIds,
                },
                {
                  onSuccess: () => {
                    notifications.show({
                      title: "Maksu luotu",
                      message: "Maksupyyntö lisättiin onnistuneesti",
                      color: "green",
                    });
                    onClose();
                  },
                },
              );
            }}
            loading={createPaymentRequest.isPending}
          >
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
