import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { useAuth } from "./hooks/use-auth";
import { Loader } from "lucide-react";

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({
    routeTree,
    context: { queryClient, auth: undefined! },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

function Loading() {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <Loader className="size-5 animate-spin" />
        </div>
    );
}

export function App() {
    const auth = useAuth();

    return (
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <Suspense fallback={<Loading />}>
                    <RouterProvider router={router} context={{ auth }} />
                </Suspense>
            </QueryClientProvider>
        </StrictMode>
    );
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}
