import React, { useState } from "react";
import MealCard from "./MealCard";
import { Modal } from "react-bootstrap";

import "./MenuItem.css";
import "../../styles.css";

const MenuItem = (props) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const [cardIsOpen, setCardIsOpen] = useState(false);
  const openCardHandler = () => setCardIsOpen(true);
  const closeCardHandler = () => setCardIsOpen(false);

  return (
    <React.Fragment>
      <MealCard
        id={props.id}
        imageUrl={props.imageUrl}
        name={props.name}
        price={props.price}
        weight={props.weight}
        handleDecrease={handleDecrease}
        handleIncrease={handleIncrease}
        quantity={quantity}
        openCardHandler={openCardHandler}
      />

      <Modal show={cardIsOpen} onHide={closeCardHandler} centered>
        <Modal.Body className="p-0">
          <MealCard
            id={props.id}
            show={cardIsOpen}
            imageUrl={props.imageUrl}
            name={props.name}
            description={props.description}
            price={props.price}
            handleDecrease={handleDecrease}
            handleIncrease={handleIncrease}
            quantity={quantity}
            openCardHandler={openCardHandler}
            closeCardHandler={closeCardHandler}
          />
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
};

export default MenuItem;
