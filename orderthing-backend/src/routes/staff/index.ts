import express from "express";

import { db } from "../../db";
import {
    authenticateJwt,
    checkRole,
    requireAuth,
} from "../../middlewares/auth";
import { changeOrderStatusSchema } from "../../types/change-order-status";
import { createItemSchema } from "../../types/create-item";
import { deleteItemSchema } from "../../types/delete-item";
import { PromoteUserSchema } from "../../types/users";

const router = express.Router();

router.get(
    "/categories",
    authenticateJwt,
    requireAuth,
    checkRole(["STAFF"]),
    async (req, res) => {
        try {
            const categories = await db.category.findMany();
            res.json({ categories });
        } catch (error) {
            console.log("Categories fetch error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post(
    "/create-item",
    authenticateJwt,
    requireAuth,
    checkRole(["STAFF"]),
    async (req, res) => {
        const validatedData = createItemSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res
                .status(403)
                .json({ message: validatedData.error.message });
        }

        const { categoryId, description, image, name, price } =
            validatedData.data;

        try {
            const existingItem = await db.item.findUnique({ where: { name } });
            if (existingItem) {
                return res
                    .status(400)
                    .json({ message: "Item with this name already exists" });
            }

            await db.item.create({
                data: {
                    categoryId,
                    description,
                    image,
                    name,
                    price,
                },
            });

            res.json({ message: "Item created!" });
        } catch (error) {
            console.log("Item creation error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.delete(
    "/delete-item/:id",
    authenticateJwt,
    requireAuth,
    checkRole(["STAFF"]),
    async (req, res) => {
        const validatedData = deleteItemSchema.safeParse(req.params);

        if (!validatedData.success) {
            return res
                .status(403)
                .json({ message: validatedData.error.message });
        }

        const { id } = validatedData.data;

        try {
            const item = await db.item.findUnique({ where: { id } });
            if (!item) {
                return res.status(404).json({ message: "Item not found" });
            }

            await db.item.delete({ where: { id } });

            res.json({ message: "Item deleted!" });
        } catch (error) {
            console.log("Item deletion error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.get(
    "/get-orders",
    authenticateJwt,
    requireAuth,
    checkRole(["STAFF"]),
    async (req, res) => {
        try {
            const orders = await db.order.findMany({
                select: {
                    id: true,
                    tableNumber: true,
                    user: { select: { firstName: true, lastName: true } },
                    orderItems: {
                        select: {
                            quantity: true,
                            item: { select: { name: true } },
                        },
                    },
                    amount: true,
                    completed: true,
                    createdAt: true,
                },
                orderBy: [
                    {
                        completed: "asc",
                    },
                    {
                        createdAt: "desc",
                    },
                ],
            });

            res.json({ orders });
        } catch (error) {
            console.log("Order fetch error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post(
    "/complete-status/",
    authenticateJwt,
    requireAuth,
    checkRole(["STAFF"]),
    async (req, res) => {
        const validatedData = changeOrderStatusSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res
                .status(403)
                .json({ message: validatedData.error.message });
        }

        try {
            const { id } = validatedData.data;

            const existingOrder = await db.order.findUnique({ where: { id } });

            if (!existingOrder) {
                return res.status(404).json({ message: "Order not found" });
            }

            await db.$transaction(async (tx) => {
                await db.order.update({
                    where: { id },
                    data: { completed: true },
                });
                await db.table.update({
                    where: { number: existingOrder.tableNumber },
                    data: { userId: null },
                });
            });

            res.json({ message: "Order status updated!" });
        } catch (error) {
            console.log("Order status update error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.get(
    "/users",
    authenticateJwt,
    requireAuth,
    checkRole(["STAFF"]),
    async (req, res) => {
        try {
            const users = await db.user.findMany({
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                }
            });

            res.json({ users });
        } catch (error) {
            console.log("Users fetch error: ", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

router.post("/promote-user", authenticateJwt, requireAuth, async (req, res) => {
    const validatedData = PromoteUserSchema.safeParse(req.body);

    if (!validatedData.success) {
        return res.status(403).json({ message: validatedData.error.message });
    }

    const { id } = validatedData.data;

    try {
        const existingUser = await db.user.findUnique({ where: { id } });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (existingUser.role === "STAFF") {
            return res.status(400).json({ message: "User is already a staff" });
        }

        await db.user.update({
            where: { id },
            data: { role: "STAFF" },
        });

        res.json({ message: "User promoted!" });
    } catch (error) {
        console.log("User promotion error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
