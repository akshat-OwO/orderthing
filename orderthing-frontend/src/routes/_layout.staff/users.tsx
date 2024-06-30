import { createFileRoute } from "@tanstack/react-router";
import axios from "@/lib/axios.config";
import { TUsersSchema, TUsersTableSchema } from "@/lib/schemas/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { AxiosResponse } from "axios";
import { ArrowUpDown, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";

export const Route = createFileRoute("/_layout/staff/users")({
    component: Users,
});

function Users() {
    return (
        <div className="flex-1 px-2 lg:px-20">
            <div className="flex-1 py-10 md:px-10 flex flex-col gap-5">
                <div className="flex justify-between items-center">
                    <h3 className="text-3xl font-semibold">Users</h3>
                </div>
                <div className="flex">
                    <ScrollArea
                        type="always"
                        className="flex-1 w-[90vw] pb-5 whitespace-nowrap rounded-md"
                    >
                        <div className="pt-10">
                            <Users.DataTable />
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}

const columns: ColumnDef<TUsersTableSchema>[] = [
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
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "firstName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    First Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "lastName",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Last Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
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
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const user = row.original;

            return new Date(user.createdAt).toLocaleString();
        },
    },
    {
        accessorKey: "role",
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
            const user = row.original;

            if (user.role === "STAFF") {
                return `Staff`;
            }

            if (row.getIsSelected()) {
                return (
                    <Users.ToggleStatusButton
                        id={user.id}
                        toggleHandle={() => row.toggleSelected(false)}
                    />
                );
            }

            if (user.role === "USER") {
                return `User`;
            }
        },
    },
];

Users.DataTable = function UserDataTable() {
    const { data, isLoading } = useQuery({
        queryKey: ["staff", "users"],
        queryFn: async () => {
            const response: AxiosResponse<TUsersSchema> =
                await axios.get("/staff/users");
            return response.data;
        },
    });

    return (
        <DataTable
            columns={columns}
            data={data && data.users && data.users.length > 0 ? data.users : []}
            isLoading={isLoading}
        />
    );
};

Users.ToggleStatusButton = function UserToggleStatusButton({
    id,
    toggleHandle,
}: {
    id: string;
    toggleHandle: () => void;
}) {
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationKey: ["staff", "users", id, "toggle-role"],
        mutationFn: async () => {
            const response: AxiosResponse<{ message: string }> =
                await axios.post(`/staff/promote-user`, { id });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({
                queryKey: ["staff", "users"],
            });
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
            Promote Role
        </Button>
    );
};

export default Users;
