import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    THistoryOrdersSchema,
    THistoryOrdersTableSchema,
} from "@/lib/schemas/history";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosResponse } from "axios";
import { ArrowUpDown } from "lucide-react";
import axios from "@/lib/axios.config";
import { DataTable } from "@/components/ui/data-table";

export const Route = createFileRoute("/_layout/history")({
    component: History,
});

function History() {
    return (
        <div className="flex-1 px-2 lg:px-20">
            <div className="flex-1 py-10 md:px-10 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-semibold">Order History</h3>
                </div>
                <div className="flex">
                    <ScrollArea
                        type="always"
                        className="flex-1 w-[90vw] pb-5 whitespace-nowrap rounded-md"
                    >
                        <div className="pt-10">
                            <History.DataTable />
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

const columns: ColumnDef<THistoryOrdersTableSchema>[] = [
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

History.DataTable = function HistoryDataTable() {
    const { data, isLoading } = useQuery({
        queryKey: ["user", "history"],
        queryFn: async () => {
            const response: AxiosResponse<THistoryOrdersSchema> =
                await axios.get("/user/history");
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
