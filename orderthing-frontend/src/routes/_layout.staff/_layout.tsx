import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/staff/_layout")({
    component: Layout,
});

function Layout() {
    return (
        <div>
            <Outlet />
        </div>
    );
}
