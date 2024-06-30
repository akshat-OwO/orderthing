import { z } from "zod";

export type Auth = {
    isAuthenticated: boolean;
    user?: TUser | null;
};

export const User = z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(["USER", "STAFF"]),
});

export type TUser = z.infer<typeof User>;

export const RegisterAuthSchema = z
    .object({
        email: z.string().email(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
        firstName: z.string(),
        lastName: z.string(),
    })
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (confirmPassword !== password) {
            ctx.addIssue({
                code: "custom",
                message: "Passwords do not match",
                path: ["confirmPassword"],
            });
        }
    });

export type TRegisterAuthSchema = z.infer<typeof RegisterAuthSchema>;

export const LoginAuthSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type TLoginAuthSchema = z.infer<typeof LoginAuthSchema>;
