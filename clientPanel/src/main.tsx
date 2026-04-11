import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.scss";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { BrowserRouter, Link } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorFallback } from "./shared/errorFallback/ErrorFallback.tsx"

import { App } from "./App.tsx";
import { Notifications } from "@mantine/notifications";
import { initRumMonitoring, sendRumReactError } from "./monitoring/rum.ts";
import {queryClient} from "./shared/clients/queryClient.ts";
import {ErrorBoundary} from "react-error-boundary";

initRumMonitoring();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <MantineProvider defaultColorScheme="auto">
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={(error: Error) => {
              sendRumReactError(error);
            }}
          >
            <App />
          </ErrorBoundary>

          <Notifications />
        </QueryClientProvider>
      </MantineProvider>
    </BrowserRouter>
  </StrictMode>,
);
