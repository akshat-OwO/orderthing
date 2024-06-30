import { z } from "zod";

export const CheckoutSchema = z.object({
    tableNumber: z.coerce.number().min(1),
});

export type TCheckoutSchema = z.infer<typeof CheckoutSchema>;
