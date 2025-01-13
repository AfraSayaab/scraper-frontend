import React from "react";
import Tables from "../views/admin/tables/index";
import Settings from "../views/admin/settings/Settings";
import {MdBarChart, MdOutlineSettingsAccessibility} from "react-icons/md";

const AdminRoutes = [

  {
    name: "Appended Data",
    layout: "/scraper/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "default",
    component: <Tables/>,
  },

  {
    name: "Settings",
    layout: "/scraper/admin",
    icon: <MdOutlineSettingsAccessibility className="h-6 w-6" />,
    path: "Settings",
    component: <Settings />,
  },

];
export default AdminRoutes;
