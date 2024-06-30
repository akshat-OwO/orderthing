import { z } from "zod";

export const changeOrderStatusSchema = z.object({
    id: z.string(),
});
