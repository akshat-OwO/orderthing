import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_layout")({
    component: Layout,
});

function Layout() {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <Outlet />
        </div>
    );
}
