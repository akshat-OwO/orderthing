import { z } from "zod";

export const HistoryOrdersTableSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    tableNumber: z.number(),
    amount: z.number(),
    completed: z.boolean(),
    orderItems: z.array(
        z.object({ item: z.object({ name: z.string() }), quantity: z.number() })
    ),
});

export type THistoryOrdersTableSchema = z.infer<
    typeof HistoryOrdersTableSchema
>;

export const HistoryOrdersSchema = z.object({
    orders: z.array(HistoryOrdersTableSchema),
});

export type THistoryOrdersSchema = z.infer<typeof HistoryOrdersSchema>;
