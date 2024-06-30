import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../db";
import dotenv from "dotenv";

import { registerSchema, loginSchema } from "../../types/auth";

dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const validatedData = registerSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res
                .status(403)
                .json({ message: validatedData.error.message });
        }

        const { email, firstName, lastName, password } = validatedData.data!;

        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
            },
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET ?? ""
        );
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });
        res.json({ message: "User created!" });
    } catch (error) {
        console.log("Registration error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const validatedData = loginSchema.safeParse(req.body);

        if (!validatedData.success) {
            return res
                .status(403)
                .json({ message: validatedData.error.message });
        }

        const { email, password } = validatedData.data!;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET ?? ""
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 3 * 24 * 60 * 60 * 1000,
        });

        res.json({ message: "Logged in!" });
    } catch (error) {
        console.log("Login error: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
