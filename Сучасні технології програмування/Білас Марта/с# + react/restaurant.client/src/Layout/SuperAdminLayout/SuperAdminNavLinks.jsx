import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

import UserLineIcon from "remixicon-react/UserLineIcon";
import "../HeaderNavLinks.css";
import AuthDraw from "../../Pages/AuthDraw";

export const SuperAdminHeaderNavLinks = () => {

  const [showAuth, setShowAuth] = useState(false);
  const openAuthHandler = () => {
    setShowAuth(true);
  };
  const closeAuthHandler = () => {
    setShowAuth(false);
  };

  return (
    <React.Fragment>
      {showAuth && (
        <AuthDraw
          closeAuthHandler={closeAuthHandler}
          showAuth={showAuth}
        />
      )}
      <ul>
        <li>
          <NavLink to="/">Menu</NavLink>
        </li>
        <li>
          <NavLink to="/contactInfo">Info</NavLink>
        </li>
        <li>
          <NavLink to="/administrators">Admins</NavLink>
        </li>
        <li>
          <NavLink to="/orders">Orders</NavLink>
        </li>
        <li>
          <Link onClick={openAuthHandler}>
            <UserLineIcon />
          </Link>
        </li>
      </ul>
    </React.Fragment>
  );
};

