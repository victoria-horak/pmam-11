import React from "react";
import { Link } from "react-router-dom";

import { SuperAdminHeaderNavLinks } from "./SuperAdminNavLinks.jsx";
import "../Header.css";

export const SuperAdminHeader = () => {

  return (
    <React.Fragment>
      <header id="header" className=" d-flex align-items-center">
        <div className="container d-flex align-items-center">
          <Link className="logo me-auto" to="/">
            Logo
          </Link>
          <nav className="navbar">
            <SuperAdminHeaderNavLinks />
          </nav>
        </div>
      </header>
    </React.Fragment>
  );
};
