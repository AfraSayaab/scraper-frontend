import { Navigate, Outlet } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import Admin from "../layouts/admin";
import Login from "views/AdminCredentials/Login";
import Signup from "views/AdminCredentials/Signup";
import PrivateRoute from "PrivateRoute/PrivateRoute";

const ThemeRoutes = [
  {
    path: "/", // Only redirect if the user visits the root "/"
    element: <Navigate to="/scraper/admin" replace />, // Use 'replace' to avoid adding to history stack
  },
  {
    path: "/scraper/admin/*", // Matches all routes under "/admin"
    element: (
      <PrivateRoute>
        <Admin />
      </PrivateRoute>
    ), // Main layout component
    children: [
      ...AdminRoutes.map((route) => ({
        path: route.path, // Relative path from AdminRoutes
        element: route.component, // Component to render
      })),
    ],
  },
  {
    path: "/scraper/admins",
    element: <Outlet />,
    children: [
      { path: "Login", exact: true, element: <Login /> },
      { path: "Signup", exact: true, element: <Signup /> },
    ],
  },
];

export default ThemeRoutes;
