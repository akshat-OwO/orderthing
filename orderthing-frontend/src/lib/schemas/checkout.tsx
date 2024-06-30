import { z } from "zod";

export const CheckoutSchema = z.object({
    tableNumber: z.coerce
        .number()
        .min(1, { message: "Please select a table number" }),
});

export type TCheckoutSchema = z.infer<typeof CheckoutSchema>;
