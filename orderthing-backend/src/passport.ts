import dotenv from "dotenv";
import passport from "passport";
import {
    Strategy as JwtStrategy,
    StrategyOptionsWithoutRequest,
    VerifiedCallback
} from "passport-jwt";
import { db } from "./db";

dotenv.config();

const cookieExtract = (req: any) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["token"];
    }
    return token;
};

const opts: StrategyOptionsWithoutRequest = {
    secretOrKey: process.env.JWT_SECRET ?? "",
    jwtFromRequest: cookieExtract,
};

interface JwtPayload {
    id: string;
    email: string;
    role: "USER" | "STAFF";
}

export function initPassport() {
    passport.use(
        new JwtStrategy(
            opts,
            async (jwt_payload: JwtPayload, done: VerifiedCallback) => {
                try {
                    const user = await db.user.findUnique({
                        where: { id: jwt_payload.id },
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            role: true,
                        },
                    });

                    if (user) {
                        return done(null, user);
                    } else {
                        return done(null, false);
                    }
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await db.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                },
            });
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
}
