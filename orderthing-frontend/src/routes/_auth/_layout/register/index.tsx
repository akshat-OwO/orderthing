import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { RegisterAuthSchema, TRegisterAuthSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import axios from "@/lib/axios.config";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/_layout/register/")({
    component: Register,
});

function Register() {
    const [inputPasswordType, setInputPasswordType] = useState<
        "password" | "text"
    >("password");
    const [inputConfirmPasswordType, setInputConfirmPasswordType] = useState<
        "password" | "text"
    >("password");

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<TRegisterAuthSchema>({
        mode: "onChange",
        resolver: zodResolver(RegisterAuthSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationKey: ["auth", "user", "register"],
        mutationFn: async (values: TRegisterAuthSchema) => {
            const response: AxiosResponse<{ message: string }> =
                await axios.post("/user/auth/register", values);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.refetchQueries({ queryKey: ["auth"] });
            return navigate({ to: "/" });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const onSubmit = (values: TRegisterAuthSchema) => {
        mutate(values);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register to OrderThing</CardTitle>
            </CardHeader>
            <CardContent className="min-w-96">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full flex flex-col gap-2"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="example@mail.com"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                placeholder={
                                                    inputPasswordType ===
                                                    "password"
                                                        ? "*******"
                                                        : "123456"
                                                }
                                                {...field}
                                                type={inputPasswordType}
                                            />
                                            <Button
                                                title="Toggle Password Visibility"
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setInputPasswordType(
                                                        inputPasswordType ===
                                                            "password"
                                                            ? "text"
                                                            : "password"
                                                    )
                                                }
                                            >
                                                {inputPasswordType ===
                                                "password" ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                placeholder={
                                                    inputConfirmPasswordType ===
                                                    "password"
                                                        ? "*******"
                                                        : "123456"
                                                }
                                                {...field}
                                                type={inputConfirmPasswordType}
                                            />
                                            <Button
                                                title="Toggle Password Visibility"
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setInputConfirmPasswordType(
                                                        inputConfirmPasswordType ===
                                                            "password"
                                                            ? "text"
                                                            : "password"
                                                    )
                                                }
                                            >
                                                {inputConfirmPasswordType ===
                                                "password" ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-start gap-2">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="John"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Doe"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button
                            title="Register"
                            type="submit"
                            className="mt-5 gap-2"
                        >
                            {isPending && (
                                <Loader className="size-5 animate-spin" />
                            )}
                            Register
                        </Button>
                    </form>
                </Form>
                <div className="pt-5 flex flex-col gap-5">
                    <p className="self-center font-medium text-sm text-muted-foreground">
                        OR
                    </p>
                    <Link
                        to="/login"
                        title="Login"
                        className={cn(buttonVariants({ variant: "secondary" }))}
                    >
                        Login
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
