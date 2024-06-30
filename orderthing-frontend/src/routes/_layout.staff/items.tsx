import Items from "@/components/items";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/staff/items")({
    component: ItemsPage,
});

function ItemsPage() {
    return (
        <div className="flex-1 px-2 lg:px-20 flex divide-x">
            <Items />
        </div>
    );
}
