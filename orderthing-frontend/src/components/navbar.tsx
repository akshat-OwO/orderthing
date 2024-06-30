import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
    History,
    LogOut,
    PanelRightClose,
    ShoppingCart,
    UserCircle,
    UserRoundCog,
    Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/use-auth";
import axios from "../lib/axios.config";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button, buttonVariants } from "./ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./ui/drawer";

const Navbar = () => {
    const auth = useAuth();
    const cart = useCart();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleLogout = () => {
        toast.promise(axios.post("/logout"), {
            loading: "Logging out...",
            success: () => {
                auth.logout();
                queryClient.invalidateQueries({ queryKey: ["auth"] });
                navigate({ to: "/login" });
                return "Logged out successfully";
            },
            error: "Failed to logout",
        });
    };

    return (
        <nav className="h-14 p-5 md:px-20 border-b bg-background flex items-center justify-between">
            <h1 className="text-2xl font-semibold">OrderThing</h1>
            <div className="flex items-center gap-5">
                <Button
                    title="Cart"
                    variant="ghost"
                    size="icon"
                    onClick={() => cart.onOpen()}
                >
                    <ShoppingCart className="size-5" />
                </Button>
                <Drawer direction="right">
                    <DrawerTrigger>
                        <Avatar>
                            <AvatarFallback className="bg-transparent">
                                <UserCircle className="size-8" />
                            </AvatarFallback>
                        </Avatar>
                    </DrawerTrigger>
                    <DrawerContent
                        hidePill
                        className="md:left-1/2 lg:left-2/3 md:right-0 h-full rounded-none md:rounded-tl-md md:rounded-bl-md"
                    >
                        <div className="pr-5 flex gap-2 items-center">
                            <DrawerHeader className="flex-1">
                                <DrawerTitle>Profile</DrawerTitle>
                                <DrawerDescription>
                                    Customize your Profile
                                </DrawerDescription>
                            </DrawerHeader>
                            <DrawerClose asChild>
                                <Button
                                    title="Close Profile"
                                    variant="outline"
                                    size="icon"
                                >
                                    <PanelRightClose className="size-5" />
                                </Button>
                            </DrawerClose>
                        </div>
                        <div className="px-5 pt-10 flex flex-col gap-5">
                            <Avatar className="self-center size-48">
                                <AvatarFallback className="bg-transparent">
                                    <UserCircle className="size-full" />
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={cn(
                                    buttonVariants({
                                        className: "justify-between",
                                        variant: "outline",
                                    })
                                )}
                            >
                                <span className="font-semibold">
                                    First Name
                                </span>
                                {auth.user?.firstName}
                            </div>
                            <div
                                className={cn(
                                    buttonVariants({
                                        className: "justify-between",
                                        variant: "outline",
                                    })
                                )}
                            >
                                <span className="font-semibold">Last Name</span>
                                {auth.user?.lastName}
                            </div>
                            <div
                                className={cn(
                                    buttonVariants({
                                        className: "justify-between",
                                        variant: "outline",
                                    })
                                )}
                            >
                                <span className="font-semibold">Email</span>
                                {auth.user?.email}
                            </div>
                            {auth.user?.role === "STAFF" && (
                                <div
                                    className={cn(
                                        buttonVariants({
                                            className: "justify-between",
                                            variant: "outline",
                                        })
                                    )}
                                >
                                    <span className="font-semibold">Role</span>
                                    {auth.user?.role}
                                </div>
                            )}
                            <Link
                                to="/history"
                                className={cn(
                                    buttonVariants({
                                        className: "justify-between",
                                        variant: "outline",
                                    })
                                )}
                            >
                                <History className="size-5" />
                                <span>Order History</span>
                            </Link>
                            {auth.user?.role === "STAFF" && (
                                <Link
                                    to="/staff"
                                    className={cn(
                                        buttonVariants({
                                            className: "justify-between",
                                        })
                                    )}
                                >
                                    <UserRoundCog className="size-5" />
                                    <span>Manage Users</span>
                                </Link>
                            )}
                            {auth.user?.role === "STAFF" && (
                                <Link
                                    to="/staff"
                                    className={cn(
                                        buttonVariants({
                                            className: "justify-between",
                                        })
                                    )}
                                >
                                    <Users className="size-5" />
                                    <span>Staff Portal</span>
                                </Link>
                            )}
                            <Button
                                title="Logout"
                                variant="destructive"
                                className="w-full justify-between"
                                onClick={() => handleLogout()}
                            >
                                <LogOut />
                                Logout
                            </Button>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>
        </nav>
    );
};

export default Navbar;
