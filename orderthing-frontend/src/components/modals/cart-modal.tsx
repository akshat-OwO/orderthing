import { useCart } from "@/hooks/use-cart";
import axios from "@/lib/axios.config";
import { TCartSchema } from "@/lib/schemas/cart";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import {
    CheckIcon,
    Loader,
    MinusIcon,
    PanelRightClose,
    PlusIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "../ui/drawer";
import { Separator } from "../ui/separator";
import { TTables } from "@/lib/schemas/table";
import { useForm } from "react-hook-form";
import { CheckoutSchema, TCheckoutSchema } from "@/lib/schemas/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

const CartModal = () => {
    const cart = useCart();

    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        enabled: cart.isOpen,
        queryKey: ["cart"],
        queryFn: async () => {
            const response: AxiosResponse<TCartSchema> =
                await axios.get("/user/cart");
            return response.data;
        },
    });

    const { data: tableData } = useQuery({
        enabled: cart.isOpen,
        queryKey: ["tables"],
        queryFn: async () => {
            const response: AxiosResponse<TTables> =
                await axios.get("/user/tables");
            return response.data;
        },
    });

    const form = useForm<TCheckoutSchema>({
        mode: "onChange",
        resolver: zodResolver(CheckoutSchema),
        defaultValues: {
            tableNumber: 1,
        },
    });

    const { mutate: checkout, isPending } = useMutation({
        mutationKey: ["user", "checkout"],
        mutationFn: async (values: TCheckoutSchema) => {
            const response: AxiosResponse<{ message: string }> =
                await axios.post("/user/checkout", values);
            return response.data;
        },
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: ["cart"] });
            await queryClient.invalidateQueries({
                queryKey: ["staff", "orders"],
            });
            await queryClient.invalidateQueries({ queryKey: ["tables"] });
            toast.success(data.message);
            cart.onClose();
        },
    });

    const onSubmit = (values: TCheckoutSchema) => {
        checkout(values);
    };

    return (
        <Drawer open={cart.isOpen} onClose={cart.onClose} direction="right">
            <DrawerContent
                hidePill
                className="md:left-1/2 lg:left-2/3 md:right-0 h-full rounded-none md:rounded-tl-md md:rounded-bl-md"
            >
                <div className="pr-5 flex gap-2 items-center">
                    <DrawerHeader className="flex-1">
                        <DrawerTitle>Cart</DrawerTitle>
                        <DrawerDescription>
                            Proceed to checkout
                        </DrawerDescription>
                    </DrawerHeader>
                    <Button
                        title="Close Cart"
                        variant="outline"
                        size="icon"
                        onClick={() => cart.onClose()}
                    >
                        <PanelRightClose className="size-5" />
                    </Button>
                </div>
                <div className="pt-10 px-5 grid gap-3">
                    {isLoading && (
                        <div className="justify-self-center">
                            <Loader className="size-5 animate-spin" />
                        </div>
                    )}
                    {data &&
                        data.cartItems &&
                        data.cartItems.length > 0 &&
                        data.cartItems.map((cartItem) => (
                            <CartModal.Item
                                key={cartItem.id}
                                cartItem={cartItem}
                            />
                        ))}
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div className="font-medium">Total</div>
                        <div className="text-lg font-bold">
                            ₹{data && data.amount !== null ? data.amount : "0"}
                        </div>
                    </div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-3"
                        >
                            <FormField
                                control={form.control}
                                name="tableNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Table Number</FormLabel>
                                        <Select onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="1" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {tableData &&
                                                tableData.tables &&
                                                tableData.tables.length > 0 ? (
                                                    tableData.tables.map(
                                                        (table) => (
                                                            <SelectItem
                                                                key={table.id}
                                                                value={table.number.toString()}
                                                            >
                                                                {table.number}
                                                            </SelectItem>
                                                        )
                                                    )
                                                ) : (
                                                    <SelectItem
                                                        value="N/A"
                                                        disabled
                                                    >
                                                        No tables available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="w-full gap-2"
                            >
                                {isPending && (
                                    <Loader className="size-5 animate-spin" />
                                )}
                                Checkout
                            </Button>
                        </form>
                    </Form>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

CartModal.Item = function CartModalItem({
    cartItem,
}: {
    cartItem: TCartSchema["cartItems"][0];
}) {
    const [itemQuantity, setItemQuantity] = useState<number>(cartItem.quantity);

    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationKey: ["user", "cart", "update"],
        mutationFn: async () => {
            const response: AxiosResponse<{ message: string }> =
                await axios.post(`/user/update-cart`, {
                    itemId: cartItem.item.id,
                    quantity: itemQuantity,
                });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return (
        <div className="flex items-center gap-3">
            <img
                src={cartItem.item.image}
                alt={cartItem.item.name}
                width={64}
                height={64}
                className="rounded-md"
            />
            <div className="flex-1">
                <div className="font-medium">{cartItem.item.name}</div>
                <div className="text-sm text-muted-foreground">
                    ₹{cartItem.item.price}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    disabled={itemQuantity < 1}
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        if (itemQuantity > 0) {
                            setItemQuantity(itemQuantity - 1);
                        }
                    }}
                >
                    <MinusIcon className="h-4 w-4" />
                </Button>
                <div>{itemQuantity}</div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                >
                    <PlusIcon className="h-4 w-4" />
                </Button>
                <Button
                    title="Update Quantity"
                    disabled={cartItem.quantity === itemQuantity}
                    variant="ghost"
                    size="icon"
                    onClick={() => mutate()}
                >
                    {isPending ? (
                        <Loader className="size-5 animate-spin" />
                    ) : (
                        <CheckIcon className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    );
};

export default CartModal;
