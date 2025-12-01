import { React, useState } from "react";
import { Row, Col, Button, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

import { logOut } from "../../services/UserService";
import { useAuth } from "../../state/Auth/AuthContext";
import UserOrdersList from "./UserOrders/UserOrdersList";
import UserInfo from "./UserInfo";
import "./UserAccount.css";

const UserAccount = () => {
  const { logout } = useAuth();
  const [currentComponent, setCurrentComponent] = useState(0);

  const setCurrentComponentHandler = (componentNumber) => {
    setCurrentComponent(componentNumber);
  };

  const renderComponent = () => {
    switch (currentComponent) {
      case 0:
        return <UserOrdersList />;
      case 1:
        return <UserInfo />;
      default:
        return null;
    }
  };
  const handleLogout = async () => {
    try {
      const response = await logOut();
      if (response.status === 200) {
        console.log("log out success");
        logout();
      }
    } catch (error) {
      console.error("log out failed" + error);
    }
  };
  return (
    <Container className="d-flex flex-column" style={{ minHeight: "83vh" }}>
      <Row>
        <Col>
          <Link
            className="animated-anchor"
            onClick={() => setCurrentComponentHandler(0)}
          >
            My orders
          </Link>
        </Col>
        <Col>
          <Link
            className="animated-anchor"
            onClick={() => setCurrentComponentHandler(1)}
          >
            My info
          </Link>
        </Col>
      </Row>
      {renderComponent()}
      <Row className="mt-auto justify-content-end">
        <Col xs="auto">
          <Button variant="danger" onClick={handleLogout}>
            Log out
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default UserAccount;
