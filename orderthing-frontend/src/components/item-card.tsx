import axios from "@/lib/axios.config";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { format } from "date-fns";
import { Loader, Minus, Plus, ShoppingCart, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ItemQuantitySchema } from "@/lib/schemas/items";

interface ItemCardProps {
    item: {
        id: string;
        name: string;
        description: string;
        price: number;
        category: { name: string; id: string };
        createdAt: string;
        image: string;
    };
    mode: "view" | "edit";
}

const ItemCard: React.FC<ItemCardProps> = ({ item, mode }) => {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
        useState<boolean>(false);

    const [itemQuantity, setItemQuantity] = useState<number>(0);

    const queryClient = useQueryClient();

    const { mutate: addToCart, isPending } = useMutation({
        mutationKey: ["user", "item", item.id, itemQuantity, "add"],
        mutationFn: async () => {
            const response: AxiosResponse<{ message: string }> =
                await axios.post("/user/add-to-cart", {
                    itemId: item.id,
                    quantity: itemQuantity,
                });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["cart"] });
            setItemQuantity(0);
        },
    });

    const { mutate: deleteItem, isPending: deletingItem } = useMutation({
        mutationKey: ["staff", "item", item.id, "delete"],
        mutationFn: async () => {
            const response: AxiosResponse<{ message: string }> =
                await axios.delete(`/staff/delete-item/${item.id}`);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["items"] });
        },
    });

    const handleItemQuantity = (value: string) => {
        const validatedQuantity = ItemQuantitySchema.safeParse(value);

        if (validatedQuantity.success) {
            setItemQuantity(validatedQuantity.data);
        }
    };

    const handleDelete = () => {
        deleteItem();
    };

    return (
        <div className="h-fit w-full bg-card p-4 rounded-lg shadow-md">
            <img
                src={item.image}
                alt={item.name}
                width={300}
                height={200}
                className="mb-4 rounded-md object-cover aspect-square w-full"
            />
            <div className="mb-4">
                <h3 className="text-lg font-bold">{item.name}</h3>
                <p className="text-muted-foreground line-clamp-2">
                    {item.description}
                </p>
            </div>
            <div className="flex justify-between items-center mb-4">
                <span className="text-primary font-bold">₹{item.price}</span>
                <span className="text-muted-foreground">
                    {item.category.name}
                </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-between items-center">
                {mode === "edit" && (
                    <AlertDialog
                        open={isDeleteDialogOpen}
                        onOpenChange={setIsDeleteDialogOpen}
                    >
                        <AlertDialogTrigger asChild>
                            <Button
                                title="Delete Item"
                                variant="destructive"
                                size="icon"
                                className="ml-auto"
                            >
                                <Trash className="size-5" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you sure you want to Delete this item?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <Button
                                    disabled={deletingItem}
                                    variant="destructive"
                                    className="gap-2"
                                    onClick={() => handleDelete()}
                                >
                                    {deletingItem ? (
                                        <Loader className="size-5 animate-spin" />
                                    ) : (
                                        <Trash className="size-5" />
                                    )}
                                    Delete Item
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                {mode === "view" && (
                    <>
                        <Button
                            disabled={itemQuantity < 1 || isPending}
                            variant={itemQuantity < 1 ? "outline" : "default"}
                            className="gap-2 flex-1"
                            onClick={() => addToCart()}
                        >
                            {isPending ? (
                                <Loader className="size-5 animate-spin" />
                            ) : (
                                <ShoppingCart className="size-5" />
                            )}
                            Add to cart
                        </Button>
                        <div className="flex-1 flex items-center gap-2">
                            <Button
                                disabled={itemQuantity < 1}
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    if (itemQuantity > 0) {
                                        setItemQuantity(itemQuantity - 1);
                                    }
                                }}
                            >
                                <Minus className="size-5" />
                            </Button>
                            <Input
                                value={itemQuantity}
                                onChange={(e) =>
                                    handleItemQuantity(e.target.value)
                                }
                                className="flex-1 w-16"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setItemQuantity(itemQuantity + 1);
                                }}
                            >
                                <Plus className="size-5" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
            {mode === "edit" && (
                <div className="mt-4 flex justify-end text-xs text-muted-foreground">
                    Created on: {format(item.createdAt, "yyyy-MM-dd")}
                </div>
            )}
        </div>
    );
};

export default ItemCard;
