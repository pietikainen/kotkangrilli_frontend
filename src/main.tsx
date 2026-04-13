import {
  ColorSchemeScript,
  createTheme,
  MantineProvider,
  v8CssVariablesResolver,
} from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import React from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/schedule/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

const queryClient = new QueryClient();
const theme = createTheme({
  defaultRadius: "sm",
});

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <>
      <ColorSchemeScript defaultColorScheme="auto" />
      <MantineProvider
        cssVariablesResolver={v8CssVariablesResolver}
        defaultColorScheme="auto"
        theme={theme}
      >
        <DatesProvider settings={{ locale: "fi" }}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </DatesProvider>
        <Notifications pauseResetOnHover="notification" />
      </MantineProvider>
    </>,
  );
}
