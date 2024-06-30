import axios from "@/lib/axios.config";
import { TCategorySchema } from "@/lib/schemas/category";
import { ItemSchema, TItemSchema, TItemsSchema } from "@/lib/schemas/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { Loader, PanelRightClose, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import ItemCard from "./item-card";
import { Button } from "./ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./ui/drawer";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

const Items = () => {
    const { data, isLoading } = useQuery({
        queryKey: ["items"],
        queryFn: async () => {
            const response: AxiosResponse<TItemsSchema> =
                await axios.get("/items");
            return response.data;
        },
    });
    return (
        <div className="flex-1 py-10 md:px-10 flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <h3 className="text-3xl font-semibold">Items</h3>
                <Items.Create />
            </div>
            {isLoading && (
                <div className="pt-10 flex justify-center items-center">
                    <Loader className="size-10 animate-spin" />
                </div>
            )}
            {data && data.items && data.items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {data.items.map((item) => (
                        <ItemCard key={item.id} item={item} mode="edit" />
                    ))}
                </div>
            )}
        </div>
    );
};

Items.Create = function CreateItem() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["staff", "categories"],
        queryFn: async () => {
            const response: AxiosResponse<TCategorySchema> =
                await axios.get("/staff/categories");
            return response.data;
        },
    });

    const { mutate, isPending } = useMutation({
        mutationKey: ["staff", "items", "create"],
        mutationFn: async (values: TItemSchema) => {
            const response = await axios.post("/staff/create-item", values);
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({ queryKey: ["items"] });
            form.reset();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const form = useForm<TItemSchema>({
        mode: "onChange",
        resolver: zodResolver(ItemSchema),
        defaultValues: {
            categoryId: "",
            description: "",
            image: "",
            name: "",
            price: 0,
        },
    });

    const onSubmit = async (values: TItemSchema) => {
        mutate(values);
    };

    return (
        <Drawer direction="right">
            <DrawerTrigger asChild>
                <Button className="gap-2">
                    <Plus className="size-5" />
                    Create Item
                </Button>
            </DrawerTrigger>
            <DrawerContent
                hidePill
                className="md:left-1/2 lg:left-2/3 md:right-0 h-full rounded-none md:rounded-tl-md md:rounded-bl-md"
            >
                <div className="pr-5 flex gap-2 items-center">
                    <DrawerHeader className="flex-1">
                        <DrawerTitle>Create Item</DrawerTitle>
                        <DrawerDescription>
                            Fill in the form below to create a new item.
                        </DrawerDescription>
                    </DrawerHeader>
                    <DrawerClose asChild>
                        <Button
                            title="Close Item Drawer"
                            variant="outline"
                            size="icon"
                        >
                            <PanelRightClose className="size-5" />
                        </Button>
                    </DrawerClose>
                </div>
                <div className="pt-10 px-5">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col gap-5"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Description"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Price"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {!isLoading && (
                                <FormField
                                    name="categoryId"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Appetizers" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {data &&
                                                    data.categories &&
                                                    data.categories.length >
                                                        0 ? (
                                                        data.categories.map(
                                                            (category) => (
                                                                <SelectItem
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    value={
                                                                        category.id
                                                                    }
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </SelectItem>
                                                            )
                                                        )
                                                    ) : (
                                                        <SelectItem
                                                            value="N/A"
                                                            disabled
                                                        >
                                                            No Categories
                                                            Available
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image Url</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Image URL"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="gap-2"
                            >
                                {isPending && (
                                    <Loader className="size-5 animate-spin" />
                                )}
                                Add Item
                            </Button>
                        </form>
                    </Form>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

export default Items;
