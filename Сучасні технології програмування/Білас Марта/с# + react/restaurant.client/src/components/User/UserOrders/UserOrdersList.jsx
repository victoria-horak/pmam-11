import React from "react";
import Accordion from "react-bootstrap/Accordion";
import { Row, Col } from "react-bootstrap";
import { useState, useEffect } from "react";

import UserOrder from "./UserOrder";
import { getUserOrdersByEmail } from "../../../services/UserInfo";
import { useAuth } from "../../../state/Auth/AuthContext";

const UserOrdersList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getUserOrdersByEmail(user.email);
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error during fetching user orders:", error);
      }
    };

    fetchOrders();
  }, [user]);

  return (
    <>
      {orders && orders.length > 0 ? (
        <Accordion className="pb-3">
          {orders.map((order) => (
            <Accordion.Item key={order.id} eventKey={order.id}>
              <Accordion.Header>Order #{order.id}</Accordion.Header>
              <Accordion.Body>
                <UserOrder order={order} />
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : (
        <Row className=" d-block justify-content-center align-items-center">
          <Col className="text-center fs-3">
            <div className="text-center fs-3 ratio ratio-16x9 ">
              <iframe src="https://lottie.host/embed/b9a47eca-0388-418f-8452-d0a25dd18f04/aKpfql0W1K.json"></iframe>
            </div>
          </Col>
          <Col className="text-center fs-4">
            <strong> You haven't ordered anything yet. </strong>
          </Col>
        </Row>
      )}
    </>
  );
};

export default UserOrdersList;
