import React from "react";
import { Col, Row } from "react-bootstrap";

const EmptyCart = () => {
  return (
    <Row className="pt-4 d-block justify-content-center align-items-center">
      <Col className="text-center fs-3">
        <img
          src="src\assets\img\empty-cart.svg"
          alt="img"
          className="img-fluid"
        />
      </Col>
      <Col className="text-center fs-3">
        <strong> The cart is empty </strong>
      </Col>
    </Row>
  );
};

export default EmptyCart;
