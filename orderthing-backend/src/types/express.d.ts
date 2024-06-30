import { User as CustomUser } from "@prisma/client";

declare global {
    type SanitizedUser = Omit<
        CustomUser,
        "password" | "createdAt" | "updatedAt"
    >;

    namespace Express {
        interface Request {
            user?: Omit<CustomUser, "password" | "createdAt" | "updatedAt">;
            isAuthenticated(): boolean;
        }
    }
}

export {};
