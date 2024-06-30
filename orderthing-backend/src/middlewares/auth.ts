import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { User } from "@prisma/client";

export const authenticateJwt = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies.token;

    if (!token) {
        req.authInfo = { isAuthenticated: false };
        return next();
    }

    passport.authenticate(
        "jwt",
        { session: false },
        (err: any, user: User | false, info: any) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.isAuthenticated();
            } else {
                req.user = user;
            }
            next();
        }
    )(req, res, next);
};

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.sendStatus(401);
        }

        const hasRole = roles.find((role) => (req.user as User).role === role);

        if (!hasRole) {
            return res.sendStatus(403);
        }
        next();
    };
};

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
};
