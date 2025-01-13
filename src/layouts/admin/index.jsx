import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import AdminRoutes from "Router/AdminRoutes";

export default function Admin(props) {
  const { ...rest } = props;
  const location = useLocation();
  // Initialize open state from localStorage or default to true
  const [open, setOpen] = React.useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    return savedState ? JSON.parse(savedState) : true;
  });


  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");

  // Add resize event listener to update the open state
  React.useEffect(() => {
    const handleResize = () => {
      const shouldOpen = window.innerWidth >= 1200;
      setOpen(shouldOpen);
      localStorage.setItem('sidebarOpen', JSON.stringify(shouldOpen));
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);



  React.useEffect(() => {
    getActiveRoute(AdminRoutes);
  }, [location.pathname]);


  const getActiveRoute = (AdminRoutes) => {
    let activeRoute = "Main Dashboard";
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
        window.location.href.indexOf(
          AdminRoutes[i].layout + "/" + AdminRoutes[i].path
        ) !== -1
      ) {
        return AdminRoutes[i].secondary;
      }
    }
    return activeNavbar;
  };

  const getRoutes = (AdminRoutes) => {
    return AdminRoutes.map((prop, key) => {
      if (prop.layout === "/scraper/admin") {
        // Update to the new layout path
        return (
          <Route path={`${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

   // Function to handle sidebar toggle and save the state to localStorage
   const handleSidebarToggle = () => {
    const newOpenState = !open;
    setOpen(newOpenState);
    localStorage.setItem('sidebarOpen', JSON.stringify(newOpenState));
  };


  document.documentElement.dir = "ltr";
  return (
    <div className="flex h-full w-full">
      <Sidebar open={open} onClose={handleSidebarToggle}  />
      {/* Navbar & Main Content */}
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]`}
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
                {/* Default route */}
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
