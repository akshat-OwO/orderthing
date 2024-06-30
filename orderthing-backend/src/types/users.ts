import { z } from "zod";

export const PromoteUserSchema = z.object({
    id: z.string(),
});

export type PromoteUserInput = z.infer<typeof PromoteUserSchema>;
