import { z } from "zod";

export const deleteItemSchema = z.object({
    id: z.string(),
});
