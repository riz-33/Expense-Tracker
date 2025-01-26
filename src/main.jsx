import { createBrowserRouter, RouterProvider } from "react-router";
import App from "./App";
import { Layout } from "./components/layout";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { DashboardPage } from "./pages/DashboardPage";
import { AccountsPage } from "./pages/AccountsPage";
import TransactionsPage from "./pages/TransactionsPage";
import SettingsPage from "./pages/SettingsPage";

const router = createBrowserRouter([
  {
    Component: App,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            path: "/",
            Component: DashboardPage,
          },
          {
            path: "/transactions",
            Component: TransactionsPage,
          },
          {
            path: "/accounts",
            Component: AccountsPage,
          },
          {
            path: "/settings",
            Component: SettingsPage,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
