import { z } from "zod";

export const ItemSchema = z.object({
    name: z.string(),
    price: z.coerce.number().min(1),
    description: z.string(),
    image: z.string().url(),
    categoryId: z.string(),
});

export type TItemSchema = z.infer<typeof ItemSchema>;

export const ItemsSchema = z.object({
    items: z.array(
        ItemSchema.extend({
            id: z.string(),
            createdAt: z.string(),
            category: z.object({ id: z.string(), name: z.string() }),
        }).omit({ categoryId: true })
    ),
});

export type TItemsSchema = z.infer<typeof ItemsSchema>;

export const ItemQuantitySchema = z.coerce.number().min(0);

export type TItemQuantitySchema = z.infer<typeof ItemQuantitySchema>;
