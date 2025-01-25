import { DashboardLayout } from "@toolpad/core";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <DashboardLayout  defaultSidebarCollapsed>
      {/* <PageContainer> */}
        <Outlet />
      {/* </PageContainer> */}
    </DashboardLayout>
  );
};
