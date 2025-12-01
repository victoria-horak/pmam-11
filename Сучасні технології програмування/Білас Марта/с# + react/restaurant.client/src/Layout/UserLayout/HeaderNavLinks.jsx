import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

import UserLineIcon from "remixicon-react/UserLineIcon";
import ShoppingCartLineIcon from "remixicon-react/ShoppingCartLineIcon";
import "../HeaderNavLinks.css";
import Cart from "../../Pages/Cart";
import AuthDraw from "../../Pages/AuthDraw";

const HeaderNavLinks = () => {
  const [showCart, setShowCart] = useState(false);
  const openCartHandler = () => {
    setShowCart(true);
  };
  const closeCartHandler = () => {
    setShowCart(false);
  };

  const [showAuth, setShowAuth] = useState(false);
  const openAuthHandler = () => {
    setShowAuth(true);
  };
  const closeAuthHandler = () => {
    setShowAuth(false);
  };

  return (
    <React.Fragment>
      {showCart && (
        <Cart
          openCartHandler={openCartHandler}
          closeCartHandler={closeCartHandler}
          showCart={showCart}
        />
      )}
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
        {/*   <li>
          <NavLink to="/deliveryInfo">Delivery</NavLink>
        </li> */}
        <li>
          <Link onClick={openAuthHandler}>
            <UserLineIcon />
          </Link>
        </li>
        <li>
          <Link onClick={openCartHandler}>
            <ShoppingCartLineIcon />
          </Link>
        </li>
      </ul>
    </React.Fragment>
  );
};

export default HeaderNavLinks;
