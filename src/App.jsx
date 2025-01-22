import TimelineIcon from "@mui/icons-material/Timeline";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { Outlet } from "react-router";
import { ReactRouterAppProvider } from "@toolpad/core/react-router";
import "./App.css";

const NAVIGATION = [
  // {
  //   kind: 'header',
  //   title: 'Main items',
  // },
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
  },
  {
    segment: "accounts",
    title: "Accounts",
    icon: <AccountBalanceWalletIcon />,
  },
  {
    segment: "transactions",
    title: "Transactions",
    icon: <SyncAltIcon />,
  },
  {
    segment: "reports",
    title: "Reports",
    icon: <TimelineIcon />,
  },
];

const BRANDING = {
  title: "Expense Tracker",
  logo: (
    <img
    style={{marginTop: "2px"}}
    width={30}
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIqZtQoN6Rc8uqzVE_qSNobffTp4r8FwlMyA&s"
      alt="logo"
    />
  ),
};

export default function App() {
  return (
    <ReactRouterAppProvider navigation={NAVIGATION} branding={BRANDING}>
      <Outlet />
    </ReactRouterAppProvider>
  );
}
