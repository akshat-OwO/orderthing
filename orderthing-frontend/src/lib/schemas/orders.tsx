import { z } from "zod";

export const OrdersTableSchema = z.object({
    id: z.string(),
    createdAt: z.string(),
    tableNumber: z.number(),
    amount: z.number(),
    completed: z.boolean(),
    orderItems: z.array(
        z.object({ item: z.object({ name: z.string() }), quantity: z.number() })
    ),
    user: z.object({ firstName: z.string(), lastName: z.string() }),
});

export type TOrdersTableSchema = z.infer<typeof OrdersTableSchema>;

export const OrdersSchema = z.object({
    orders: z.array(OrdersTableSchema),
});

export type TOrdersSchema = z.infer<typeof OrdersSchema>;