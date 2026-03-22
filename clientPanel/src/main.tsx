import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import {BrowserRouter, Link} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";

import { App } from "./App.tsx";
import { Notifications } from "@mantine/notifications";
import {LINK_PATHS} from "./shared/constants/LINK_PATHS.ts";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function ErrorFallback({ error }: { error: Error }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 40,
            }}
        >
            <h2>Something went wrong</h2>
            <p>{error.message}</p>
            <Link to={LINK_PATHS.MAIN}/>
        </div>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <MantineProvider defaultColorScheme="auto">
                <QueryClientProvider client={queryClient}>

                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <App />
                    </ErrorBoundary>

                    <Notifications />
                </QueryClientProvider>
            </MantineProvider>
        </BrowserRouter>
    </StrictMode>
);