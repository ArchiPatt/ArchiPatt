import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <MantineProvider>
                <App />
            </MantineProvider>
        </BrowserRouter>
    </StrictMode>
);
