import { z } from "zod";

export const CategorySchema = z.object({
    categories: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
        })
    ),
});

export type TCategorySchema = z.infer<typeof CategorySchema>;
