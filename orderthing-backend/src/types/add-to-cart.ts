import { z } from "zod";

export const AddToCartSchema = z.object({
    itemId: z.string(),
    quantity: z.number().min(1),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>;
