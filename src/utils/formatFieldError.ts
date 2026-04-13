function getErrorMessage(error: unknown): string | null {
  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return null;
}

export default function formatFieldError(errors: unknown[] | undefined) {
  if (!errors?.length) {
    return undefined;
  }

  const messages = errors
    .map(getErrorMessage)
    .filter((message): message is string => Boolean(message));

  return messages.length > 0 ? messages.join(", ") : undefined;
}
