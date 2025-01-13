import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar/RTL";
import Sidebar from "components/sidebar/RTL";
import Footer from "components/footer/Footer";
import AdminRoutes from "Router/AdminRoutes";

export default function RTL(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);
  React.useEffect(() => {
    getActiveRoute(AdminRoutes);
  }, [location.pathname]);

  const getActiveRoute = (AdminRoutes) => {
    let activeRoute = "RTL";
    for (let i = 0; i < AdminRoutes.length; i++) {
      if (
        window.location.href.indexOf(
          AdminRoutes[i].layout + "/" + AdminRoutes[i].path
        ) !== -1
      ) {
        setCurrentRoute(AdminRoutes[i].name);
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (AdminRoutes) => {
    let activeNavbar = false;
    for (let i = 0; i < AdminRoutes.length; i++) {
      if (
        window.location.href.indexOf(AdminRoutes[i].layout + AdminRoutes[i].path) !== -1
      ) {
        return AdminRoutes[i].secondary;
      }
    }
    return activeNavbar;
  };
  const getRoutes = (AdminRoutes) => {
    return AdminRoutes.map((prop, key) => {
      if (prop.layout === "/rtl") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "rtl";
  return (
    <div className="flex h-full w-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      {/* Navbar & Main Content */}
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-[12px] h-full flex-none transition-all md:pe-2 xl:mr-[313px]`}
        >
          {/* Routes */}
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen(true)}
              logoText={"Horizon UI Tailwind React"}
              brandText={currentRoute}
              secondary={getActiveNavbar(AdminRoutes)}
              {...rest}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {getRoutes(AdminRoutes)}

                <Route
                  path="/"
                  element={<Navigate to="/scraper/admin/default" replace />}
                />
              </Routes>
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
