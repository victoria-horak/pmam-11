import { React } from "react";
import CartItemsList from "../Cart/CartItemsList";
import { Row, Col, Button } from "react-bootstrap";
import { useOrder } from "../../state/Order/OrderContext";

const Order = (props) => {
  const order = useOrder();
  const total = order.total;
  
  return (
    <>
      <p className="fs-4">Your order:</p>
      <CartItemsList />
      <hr />
      <Row className="offset-md-8 row-cols-1">
        <Col>
          <h4>Total: {total} ₴</h4>
        </Col>
      </Row>
      <Row className=" pt-3">
        <Col className="d-flex justify-content-end">
          <Button
            className="cartNext-but"
            size="md"
            onClick={props.handleNextButtonClick}
          >
            next
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default Order;
