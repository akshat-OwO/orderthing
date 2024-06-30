import { z } from "zod";

export const CheckoutSchema = z.object({
    tableNumber: z.number().min(1),
});

export type TCheckoutSchema = z.infer<typeof CheckoutSchema>;
