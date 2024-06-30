import dotenv from "dotenv";
import express from "express";
import { initPassport } from "./passport";
import cookieParser from "cookie-parser";
import passport from "passport";
import userRoutes from "./routes/user";
import staffRoutes from "./routes/staff";
import { authenticateJwt, requireAuth } from "./middlewares/auth";
import cors from "cors";
import { db } from "./db";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/", (req, res, next) => {
    console.log(new Date(), req.method, req.path);
    next();
});

const allowedHosts = process.env.ALLOWED_HOSTS
    ? process.env.ALLOWED_HOSTS.split(",")
    : [];

app.use(
    cors({
        origin: allowedHosts,
        methods: "GET,POST,PUT,DELETE",
        credentials: true,
    })
);

initPassport();
app.use(passport.initialize());

app.use("/user", userRoutes);
app.use("/staff", staffRoutes);

app.get("/", requireAuth, (req, res) => {
    res.send("Protected Hello World");
});

app.get("/auth", authenticateJwt, (req, res) => {
    if (req.isAuthenticated() && req.user) {
        res.json({
            isAuthenticated: true,
            user: req.user,
        });
    } else {
        res.json({ isAuthenticated: false, user: null });
    }
});

app.get("/items", authenticateJwt, requireAuth, async (req, res) => {
    const items = await db.item.findMany({
        select: {
            category: true,
            createdAt: true,
            description: true,
            id: true,
            image: true,
            name: true,
            price: true,
        },
    });
    res.json({ items });
});

app.post("/logout", authenticateJwt, requireAuth, (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });
    res.json({ message: "Logged out" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
