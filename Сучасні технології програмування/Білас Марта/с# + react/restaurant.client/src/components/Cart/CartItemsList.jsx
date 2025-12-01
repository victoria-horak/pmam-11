import React from "react";
import { Row } from "react-bootstrap";
import CartItem from "./CartItem";
import { useOrder } from "../../state/Order/OrderContext";

const CartItemsList = () => {
  const order = useOrder();
  const meals = order.meals;

  return (
    <Row>
      {meals.map((item) => (
        <div key={item.id}>
          <CartItem
            id={item.id}
            name={item.name}
            imageUrl={item.imageUrl}
            price={item.price}
            weight={item.weight}
            amount={item.amount}
          />
        </div>
      ))}
    </Row>
  );
};

export default CartItemsList;
