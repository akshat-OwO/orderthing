import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AxiosResponse } from "axios";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "@/lib/axios.config";
import { Auth, LoginAuthSchema, TLoginAuthSchema } from "@/lib/schemas/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_auth/_layout/login/")({
    component: Login,
});

function Login() {
    const [inputType, setInputType] = useState<"password" | "text">("password");

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const form = useForm<TLoginAuthSchema>({
        mode: "onChange",
        resolver: zodResolver(LoginAuthSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { mutate, isPending } = useMutation({
        mutationKey: ["auth", "user", "login"],
        mutationFn: async (values: TLoginAuthSchema) => {
            const response: AxiosResponse<Auth> = await axios.post(
                "/user/auth/login",
                values
            );
            return response.data;
        },
        onSuccess: () => {
            toast.success("Logged in successfully");
            queryClient.refetchQueries({ queryKey: ["auth"] });
            return navigate({ to: "/" });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const onSubmit = (values: TLoginAuthSchema) => {
        mutate(values);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Login to OrderThing</CardTitle>
            </CardHeader>
            <CardContent className="min-w-96">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="w-full flex flex-col gap-5"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="example@mail.com"
                                            {...field}
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
                                                    inputType === "password"
                                                        ? "*******"
                                                        : "123456"
                                                }
                                                {...field}
                                                type={inputType}
                                            />
                                            <Button
                                                title="Toggle Password Visibility"
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setInputType(
                                                        inputType === "password"
                                                            ? "text"
                                                            : "password"
                                                    )
                                                }
                                            >
                                                {inputType === "password" ? (
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
                        <Button title="Login" type="submit" className="gap-2">
                            {isPending && (
                                <Loader className="size-5 animate-spin" />
                            )}
                            Login
                        </Button>
                    </form>
                </Form>
                <div className="pt-5 flex flex-col gap-5">
                    <p className="self-center font-medium text-sm text-muted-foreground">
                        OR
                    </p>
                    <Link
                        to="/register"
                        title="Register"
                        className={cn(buttonVariants({ variant: "secondary" }))}
                    >
                        Register
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
