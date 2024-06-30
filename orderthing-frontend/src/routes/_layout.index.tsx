import Menu from "@/components/menu";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
    component: Index,
});

function Index() {
    return (
        <div className="flex-1 px-2 lg:px-20">
            <Menu />
        </div>
    );
}
