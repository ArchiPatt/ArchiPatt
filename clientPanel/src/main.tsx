import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {App} from "./App.tsx";


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <MantineProvider>
                <QueryClientProvider client={queryClient}>
                    <App />
                </QueryClientProvider>
            </MantineProvider>
        </BrowserRouter>
    </StrictMode>
);
