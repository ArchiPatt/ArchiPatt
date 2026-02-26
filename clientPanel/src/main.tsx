import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";
import {QueryCache, QueryClient, QueryClientProvider} from "@tanstack/react-query";

// const queryClient = new QueryClient({queryCache: new QueryCache({onSuccess: })});
const queryClient = new QueryClient();

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
