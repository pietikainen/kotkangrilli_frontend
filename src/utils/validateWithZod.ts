import { z } from "zod";

export default function validateWithZod<TFormData>(schema: z.ZodType) {
  return ({ value }: { value: TFormData }) => {
    const result = schema.safeParse(value);

    if (result.success) {
      return undefined;
    }

    const fields: Partial<Record<keyof TFormData, string>> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0];

      if (typeof field !== "string" || field in fields) {
        continue;
      }

      fields[field as keyof TFormData] = issue.message;
    }

    return { fields };
  };
}
