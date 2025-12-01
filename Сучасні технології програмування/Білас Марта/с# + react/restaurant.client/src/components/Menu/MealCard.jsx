import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import { addMealToCart } from "../../services/CartService";
import { useOrderDispatch } from "../../state/Order/OrderContext";

import "./MealCard.css";

const MealCard = (props) => {
    const dispatch = useOrderDispatch();

  const handleAddToCart = async () => {
    try {
      const addModel = {
        mealId: props.id,
        amount: props.quantity,
      };
      const contextModel = {
        id: props.id,
        imageUrl: props.imageUrl,
        name: props.name,
        price: props.price,
        weight:props.weight,
        amount: props.quantity,
      };
      const response = await addMealToCart(addModel);
      if (response.status === 200) {
        dispatch({ type: 'add', meal: contextModel });
      }
    } catch (error) {
        console.error("Error adding meal to cart:", error);
    }
  };
  return (
    <Card className="menuItem_card p-4">
      {props.show && (
        <Row className="pb-2 pt-0">
          <Col className="text-end">
            <i
              className="fa-solid fa-xmark fa-xl"
              onClick={props.closeCardHandler}
            ></i>
          </Col>
        </Row>
      )}
      <Card.Img
        className="menuItem_img"
        onClick={props.openCardHandler}
        src={props.imageUrl}
      />
      <Card.Title
        onClick={props.openCardHandler}
        className="menuItem_name pt-3"
      >
        {props.name}
      </Card.Title>
      {props.show && (
        <Card.Text className="menuItem_description">
          {props.description}
        </Card.Text>
      )}
      <Row className="m-0 short-row">
        <Col
          md="4"
          xs="4"
          className="d-flex justify-content-center align-items-center fs-4 p-0"
        >
          <p className="menuItem_price pt-3"> {props.price} ₴</p>
        </Col>
        <Col
          md="2"
          xs="2"
          className="d-flex justify-content-center align-items-center p-0 "
        >
          <button
            className="fs-4 transparent_button "
            onClick={props.handleDecrease}
          >
            <i className="fa-solid fa-minus menuItem_decrease-but"></i>
          </button>
        </Col>
        <Col
          md="2"
          xs="2"
          className="d-flex justify-content-center align-items-center p-0"
        >
          <input
            type="text"
            className="menuItem_input text-center"
            value={props.quantity}
            readOnly
          />
        </Col>
        <Col
          md="2"
          xs="2"
          className="d-flex justify-content-center align-items-center p-0"
        >
          <button
            className="fs-4 transparent_button"
            onClick={props.handleIncrease}
          >
            <i className="fa-solid fa-plus menuItem_increase-but"></i>
          </button>
        </Col>
        <Col
          md="2"
          xs="2"
          className="d-flex justify-content-center align-items-center p-0"
        >
          <button className="fs-4 transparent_button" onClick={handleAddToCart}>
            <i className="menuItem_cart fa-solid fa-basket-shopping"></i>
          </button>
        </Col>
      </Row>
    </Card>
  );
};

export default MealCard;
