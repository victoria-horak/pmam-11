import React, { useState, useEffect } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";

import "./Cart.css";
import OrderDetailsForm from "../components/Order/OrderDetailsForm";
import Order from "../components/Order/Order";
import ConfirmedOrder from "../components/Order/ConfirmedOrder";
import EmptyCart from "../components/Cart/EmptyCart";
import { useOrder } from "../state/Order/OrderContext";
import { useOrderDispatch } from "../state/Order/OrderContext";

const Cart = (props) => {
  const dispatch = useOrderDispatch();
  const order = useOrder();
  const meals = order.meals;

  const [currentComponent, setCurrentComponent] = useState(0);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const setCurrentComponentHandler = () => {
    if (meals.length === 0) {
      setCurrentComponent(0);
    } else {
      setCurrentComponent(1);
    }
  };

  useEffect(() => {
    setCurrentComponentHandler();
  }, [meals]);

  const handleNextButtonClick = () => {
    setCurrentComponent((prevComponent) => prevComponent + 1);
  };

  const handleBackButtonClick = () => {
    setCurrentComponent(1);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 0:
        return <EmptyCart />;
      case 1:
        return <Order handleNextButtonClick={handleNextButtonClick} />;
      case 2:
        return (
          <OrderDetailsForm handleNextButtonClick={handleNextButtonClick} handleOrderPlacing={setIsOrderPlaced} />
        );
      case 3:
        return <ConfirmedOrder />;
      default:
        return null;
    }
  };

  const renderHeader = () => {
    switch (currentComponent) {
      case 1:
        return <Offcanvas.Title className="fs-3">Cart</Offcanvas.Title>;
      case 2:
        return (
          <button
            className="transparent_button fs-5"
            onClick={handleBackButtonClick}
          >
            <i className="fa-solid fa-chevron-left"></i> back
          </button>
        );
      default:
        return null;
    }
  };

  const closeCartHandler = () => {
    props.closeCartHandler();
    if (isOrderPlaced) {
      dispatch({ type: "clear"}); 
      setIsOrderPlaced(false); 
    }
  };

  return (
    <Offcanvas
      placement="end"
      show={props.showCart}
      onHide={closeCartHandler}
      className="custom-offcanvas d-flex flex-column justify-content-between"
      backdropClassName="custom-offcanvas-backdrop"
    >
      <Offcanvas.Header className="pb-0" closeButton>
        {renderHeader()}
      </Offcanvas.Header>
      <Offcanvas.Body>{renderComponent()}</Offcanvas.Body>
    </Offcanvas>
  );
};

export default Cart;
