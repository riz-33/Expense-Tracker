import { BrowserRouter, Route, Routes } from "react-router-dom";
import { App } from "../App";
import "../App.css";
import TransactionsPage from "../pages/TransactionsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { AccountsPage } from "../pages/AccountsPage";
import ProfilePage from "../pages/ProfilePage";
import "../App";
import SideDrawer from "../components/SideDrawer";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SideDrawer>
              <DashboardPage />{" "}
            </SideDrawer>
          }
        />
        <Route
          path="/accounts"
          element={
            <SideDrawer>
              <AccountsPage />{" "}
            </SideDrawer>
          }
        />
        <Route
          path="/profile"
          element={
            <SideDrawer>
              <ProfilePage />{" "}
            </SideDrawer>
          }
        />
        <Route
          path="/transactions"
          element={
            <SideDrawer>
              <TransactionsPage />{" "}
            </SideDrawer>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
