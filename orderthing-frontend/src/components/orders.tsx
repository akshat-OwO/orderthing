import axios from "@/lib/axios.config";
import { TOrdersSchema, TOrdersTableSchema } from "@/lib/schemas/orders";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosResponse } from "axios";
import { ArrowUpDown, Loader } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { DataTable } from "./ui/data-table";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const Orders = () => {
    return (
        <div className="flex-1 py-10 flex flex-col gap-5">
            <div className="flex justify-between items-center">
                <h3 className="text-3xl font-semibold">Orders</h3>
                <Link to="/staff/items" className={cn(buttonVariants())}>
                    Browse Items
                </Link>
            </div>
            <div className="flex">
                <ScrollArea
                    type="always"
                    className="flex-1 w-[90vw] pb-5 whitespace-nowrap rounded-md"
                >
                    <div className="pt-10">
                        <Orders.DataTable />
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    );
};

const columns: ColumnDef<TOrdersTableSchema>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "tableNumber",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Table Number
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "user",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Ordered By
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const order = row.original;

            return `${order.user.firstName} ${order.user.lastName}`;
        },
    },
    {
        accessorKey: "orderItems",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Items
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const order = row.original;

            return (
                <div className="flex flex-col gap-0.5">
                    {order.orderItems.map((orderItem) => (
                        <span key={orderItem.item.name}>
                            <span className="font-semibold">
                                {orderItem.quantity}
                            </span>
                            {" X "}
                            <span>{orderItem.item.name}</span>
                        </span>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const order = row.original;

            return `₹${order.amount}`;
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Ordered At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const order = row.original;

            return new Date(order.createdAt).toLocaleString();
        },
    },
    {
        accessorKey: "completed",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const order = row.original;

            if (order.completed) {
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        className="cursor-default w-full"
                    >
                        Completed
                    </Button>
                );
            }

            if (row.getIsSelected()) {
                return (
                    <Orders.ToggleStatusButton
                        id={order.id}
                        toggleHandle={() => row.toggleSelected(false)}
                    />
                );
            }

            if (!order.completed) {
                return (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="cursor-default w-full"
                    >
                        Pending
                    </Button>
                );
            }
        },
    },
];

Orders.DataTable = function OrderDataTable() {
    const { data, isLoading } = useQuery({
        queryKey: ["staff", "orders"],
        queryFn: async () => {
            const response: AxiosResponse<TOrdersSchema> =
                await axios.get("/staff/get-orders");
            return response.data;
        },
    });

    return (
        <DataTable
            columns={columns}
            data={
                data && data.orders && data.orders.length > 0 ? data.orders : []
            }
            isLoading={isLoading}
        />
    );
};

Orders.ToggleStatusButton = function OrderToggleStatusButton({
    id,
    toggleHandle,
}: {
    id: string;
    toggleHandle: () => void;
}) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationKey: ["staff", "orders", id, "complete"],
        mutationFn: async () => {
            const response: AxiosResponse<{ message: string }> =
                await axios.post(`/staff/complete-status`, { id });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({
                queryKey: ["staff", "orders"],
            });
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            toggleHandle();
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    return (
        <Button
            disabled={isPending}
            variant="default"
            size="sm"
            className="w-full gap-2"
            onClick={() => mutate()}
        >
            {isPending && <Loader className="size-5 animate-spin" />}
            Mark as Completed
        </Button>
    );
};

export default Orders;
