import React from "react";
import { Outlet } from "react-router";

import { OrderProvider } from "../../state/Order/OrderContext.jsx";
import Header from "./Header.jsx";
import "../Layout.css";

const UserLayout = () => {
  return (
    <div className="layout">
      <OrderProvider>
        <Header />
        <div className="body-container">
          <Outlet />
        </div >
      </OrderProvider>
    </div>
  );
};

export default UserLayout;
