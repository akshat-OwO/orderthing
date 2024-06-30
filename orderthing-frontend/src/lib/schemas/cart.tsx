import { z } from "zod";

export const cartSchema = z.object({
    cartItems: z.array(
        z.object({
            id: z.string(),
            quantity: z.number().min(1),
            item: z.object({
                id: z.string(),
                name: z.string(),
                price: z.number(),
                image: z.string().url(),
            }),
        })
    ),
    amount: z.number(),
});

export type TCartSchema = z.infer<typeof cartSchema>;
