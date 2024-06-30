import { z } from "zod";

export const TablesSchema = z.object({
    tables: z.array(
        z.object({
            id: z.string(),
            number: z.number(),
        })
    ),
});

export type TTables = z.infer<typeof TablesSchema>;
