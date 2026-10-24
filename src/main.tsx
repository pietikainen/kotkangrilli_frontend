import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import AppThemeProvider from "./theme/AppThemeProvider";
import "./theme/global.css";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { queryClient } from "./api/queryClient";
import { routeTree } from "./routeTree.gen";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <>
      <AppThemeProvider>
        <DatesProvider settings={{ locale: "fi" }}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </DatesProvider>
        <Notifications pauseResetOnHover="notification" />
      </AppThemeProvider>
    </>,
  );
}
