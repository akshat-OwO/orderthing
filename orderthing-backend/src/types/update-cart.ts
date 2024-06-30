import { z } from "zod";

export const UpdateCartSchema = z.object({
    itemId: z.string(),
    quantity: z.coerce.number().min(0),
});

export type UpdateCartInput = z.infer<typeof UpdateCartSchema>;
