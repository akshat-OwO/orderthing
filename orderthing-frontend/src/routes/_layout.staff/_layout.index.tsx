import Orders from "@/components/orders";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/staff/_layout/")({
    component: Index,
});

function Index() {
    return (
        <div className="flex-1 px-2 md:px-5 lg:px-10 xl:px-20 flex divide-x">
            <Orders />
        </div>
    );
}
