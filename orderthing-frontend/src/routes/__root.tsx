import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "../components/ui/sonner";
import { AuthStore } from "../hooks/use-auth";
import ModalProvider from "@/components/providers/modal-provider";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    auth: AuthStore;
}>()({
    component: () => (
        <>
            <Outlet />
            <ModalProvider />
            <Toaster />
            {import.meta.env.DEV && <TanStackRouterDevtools />}
            <ReactQueryDevtools />
        </>
    ),
});
