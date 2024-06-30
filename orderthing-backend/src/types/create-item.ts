import { z } from "zod";

export const createItemSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number().min(1),
    image: z.string().url(),
    categoryId: z.string().min(1, { message: "Category is required" }),
});
