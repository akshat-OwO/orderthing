import { queryOptions } from "@tanstack/react-query";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Navbar from "../components/navbar";
import axios from "../lib/axios.config";
import { Auth } from "@/lib/schemas/auth";

const checkAuth = async () => {
    return axios.get("/auth").then((r) => r.data as Auth);
};

const checkAuthQueryOptions = queryOptions({
    queryKey: ["auth"],
    queryFn: () => checkAuth(),
});

export const Route = createFileRoute("/_layout")({
    beforeLoad: async ({ context: { queryClient, auth } }) => {
        const { isAuthenticated, user } = await queryClient.fetchQuery(
            checkAuthQueryOptions
        );

        if (!isAuthenticated && window.location.pathname === "/staff") {
            throw redirect({ to: "/staff/login" });
        }

        if (!isAuthenticated) {
            throw redirect({ to: "/login" });
        }

        auth.login({ isAuthenticated, user });

        if (
            user &&
            user.role === "USER" &&
            window.location.pathname === "/staff"
        ) {
            throw redirect({ to: "/" });
        }

        return { isAuthenticated, user };
    },
    component: Layout,
});

function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <Outlet />
        </div>
    );
}
