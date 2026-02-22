import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '@mantine/core/styles.css';
import {MantineProvider} from "@mantine/core";
import {BrowserRouter} from "react-router-dom";
import {RouteProvider} from "./providers/RouteProvider";



createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <MantineProvider>
              <RouteProvider>
                <App />
              </RouteProvider>
          </MantineProvider>
      </BrowserRouter>
  </StrictMode>,
)
