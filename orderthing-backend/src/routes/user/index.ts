import express from "express";

import authRoutes from "./auth";
import { authenticateJwt, requireAuth } from "../../middlewares/auth";
import { AddToCartSchema } from "../../types/add-to-cart";
import { db } from "../../db";
import { UpdateCartSchema } from "../../types/update-cart";
import { CheckoutSchema } from "../../types/checkout";

const router = express.Router();

router.use("/auth", authRoutes);

router.post("/add-to-cart", authenticateJwt, requireAuth, async (req, res) => {
    const validatedData = AddToCartSchema.safeParse(req.body);

    if (!validatedData.success) {
        return res.status(403).json({ message: validatedData.error.message });
    }

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId } = req.user as SanitizedUser;

    const { itemId, quantity } = validatedData.data;

    try {
        const hasItemInCart = await db.cartItem.findUnique({
            where: { userId_itemId: { userId, itemId } },
        });

        if (hasItemInCart) {
            await db.cartItem.update({
                where: { userId_itemId: { userId, itemId } },
                data: { quantity: hasItemInCart.quantity + quantity },
            });

            return res.json({ message: "Item added to cart" });
        }

        await db.cartItem.create({
            data: {
                quantity,
                item: { connect: { id: itemId } },
                user: { connect: { id: userId } },
            },
        });

        return res.json({ message: "Item added to cart" });
    } catch (error) {
        console.log("Add to cart error: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/update-cart", authenticateJwt, requireAuth, async (req, res) => {
    const validatedData = UpdateCartSchema.safeParse(req.body);

    if (!validatedData.success) {
        return res.status(403).json({ message: validatedData.error.message });
    }

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId } = req.user as SanitizedUser;

    const { itemId, quantity } = validatedData.data;

    try {
        const hasItemInCart = await db.cartItem.findUnique({
            where: { userId_itemId: { userId, itemId } },
        });

        if (!hasItemInCart) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        if (quantity === 0) {
            await db.cartItem.delete({
                where: { userId_itemId: { userId, itemId } },
            });

            return res.json({ message: "Cart item removed" });
        }

        await db.cartItem.update({
            where: { userId_itemId: { userId, itemId } },
            data: { quantity },
        });

        return res.json({ message: "Cart item updated" });
    } catch (error) {
        console.log("Update cart item error: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/cart", authenticateJwt, requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id: userId } = req.user as SanitizedUser;

        const cartItems = await db.cartItem.findMany({
            where: { userId },
            select: {
                id: true,
                quantity: true,
                item: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                    },
                },
            },
        });

        const amount = cartItems.reduce((acc, item) => {
            return acc + item.quantity * item.item.price;
        }, 0);

        return res.json({ cartItems, amount });
    } catch (error) {
        console.log("Get cart error: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/tables", authenticateJwt, requireAuth, async (req, res) => {
    try {
        const tables = await db.table.findMany({
            where: { userId: null },
            orderBy: { number: "asc" },
            select: { id: true, number: true },
        });

        return res.json({ tables });
    } catch (error) {
        console.log("Get tables error: ", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/checkout", authenticateJwt, requireAuth, async (req, res) => {
    const validatedData = CheckoutSchema.safeParse(req.body);

    if (!validatedData.success) {
        return res.status(403).json({ message: validatedData.error.message });
    }

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { id: userId } = req.user as SanitizedUser;

    const { tableNumber } = validatedData.data;

    try {
        await db.$transaction(async (tx) => {
            const table = await tx.table.findUnique({
                where: { number: tableNumber },
            });

            if (!table) {
                throw new Error("Table does not exist");
            }

            if (table.userId && table.userId !== userId) {
                throw new Error("Table is assigned to another user");
            }

            const cartItems = await tx.cartItem.findMany({
                where: { userId },
                include: { item: true },
            });

            if (cartItems.length === 0) {
                throw new Error("No items in the cart");
            }

            const amount = cartItems.reduce((acc, item) => {
                return acc + item.quantity * item.item.price;
            }, 0);

            if (!table.userId) {
                await tx.table.update({
                    where: { number: tableNumber },
                    data: { userId },
                });
            }

            await tx.order.create({
                data: {
                    tableNumber,
                    userId,
                    amount,
                    orderItems: {
                        create: cartItems.map((cartItem) => ({
                            itemId: cartItem.itemId,
                            quantity: cartItem.quantity,
                        })),
                    },
                },
            });

            // Clear the cart
            await tx.cartItem.deleteMany({
                where: { userId },
            });
        });

        return res.json({ message: "Checkout successful" });
    } catch (error: any) {
        console.log("Checkout error: ", error);
        return res.status(500).json({ message: error.message });
    }
});

router.get("/history", authenticateJwt, requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { id: userId } = req.user as SanitizedUser;

        const orders = await db.order.findMany({
            where: { userId },
            select: {
                id: true,
                tableNumber: true,
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
});

export default router;
