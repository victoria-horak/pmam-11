import React from "react";
import { Outlet } from "react-router";

import { SuperAdminHeader } from "./SuperAdminHeader.jsx";
import "../Layout.css";

export const SuperAdminLayout = () => {
  return (
    <div className="layout">
      <SuperAdminHeader />
      <div className="body-container">
        <Outlet />
      </div>
    </div>
  );
};
