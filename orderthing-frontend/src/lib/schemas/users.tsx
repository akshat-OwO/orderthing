import { z } from "zod";

export const UsersTableSchema = z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    role: z.enum(["STAFF", "USER"]),
    createdAt: z.string(),
});

export type TUsersTableSchema = z.infer<typeof UsersTableSchema>;

export const UsersSchema = z.object({
    users: z.array(UsersTableSchema),
});

export type TUsersSchema = z.infer<typeof UsersSchema>;
