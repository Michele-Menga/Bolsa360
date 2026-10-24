import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { instalarMock } from "./preview/mock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { ApiError } from "./lib/api";
import "./index.css";

const PREVIEW = !!import.meta.env.VITE_PREVIEW;
if (PREVIEW) instalarMock();
const Router = PREVIEW ? MemoryRouter : BrowserRouter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, refetchOnWindowFocus: false,
      retry: (n, e) => !(e instanceof ApiError && e.status >= 400 && e.status < 500) && n < 2,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider><App /></AuthProvider>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>,
);
