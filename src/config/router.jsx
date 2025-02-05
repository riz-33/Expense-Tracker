import "../App";
import "../App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import TransactionsPage from "../pages/TransactionsPage";
import { DashboardPage } from "../pages/DashboardPage";
import { AccountsPage } from "../pages/AccountsPage";
import ProfilePage from "../pages/ProfilePage";
import SideDrawer from "../components/SideDrawer";
import RegisterForm from "../pages/SignUp";
import LoginForm from "../pages/SignIn";
import { useEffect, useState } from "react";
import { auth, onAuthStateChanged, doc, getDoc, db } from "./firebase";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

function AppRouter() {
  const [User, setUser] = useState(false);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(true);
        }
      } else {
        setUser(false);
      }
      setLoader(false);
    });
  }, []);

  return (
    <>
      {loader ? (
        <Box
          sx={{
            display: "flex",
            height: "100vh",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={User ? <Navigate to={"/todo"} /> : <LoginForm />}
            />
            <Route
              path="/register"
              element={User ? <Navigate to={"/dashboard"} /> : <RegisterForm />}
            />
            <Route
              path="/dashboard"
              element={
                User ? (
                  <SideDrawer>
                    <DashboardPage />{" "}
                  </SideDrawer>
                ) : (
                  <Navigate to={"/"} />
                )
              }
            />
            <Route
              path="/accounts"
              element={
                User ? (
                  <SideDrawer>
                    <AccountsPage />
                  </SideDrawer>
                ) : (
                  <Navigate to={"/"} />
                )
              }
            />
            <Route
              path="/profile"
              element={
                User ? (
                  <SideDrawer>
                    <ProfilePage />
                  </SideDrawer>
                ) : (
                  <Navigate to={"/"} />
                )
              }
            />
            <Route
              path="/transactions"
              element={
                User ? (
                  <SideDrawer>
                    <TransactionsPage />
                  </SideDrawer>
                ) : (
                  <Navigate to={"/"} />
                )
              }
            />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

export default AppRouter;
