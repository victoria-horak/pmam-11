import React from "react";
import { Link } from "react-router-dom";

import HeaderNavLinks from "./HeaderNavLinks.jsx";
import "../Header.css";

const Header = () => {

  return (
    <React.Fragment>
      <header id="header" className=" d-flex align-items-center">
        <div className="container d-flex align-items-center">
          <Link className="logo me-auto" to="/">
            Logo
          </Link>
          <nav className="navbar">
            <HeaderNavLinks />
          </nav>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Header;
