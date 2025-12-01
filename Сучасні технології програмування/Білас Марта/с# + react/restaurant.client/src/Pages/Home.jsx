import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

import Catalogue from "../components/Catalog/Catalogue";
import Menu from "../components/Menu/Menu";

const Home = () => {
  const [selectedCatalogueItem, setSelectedCatalogueItem] = useState(1); // manage state here
  const [meals, setMeals] = useState([]);

  return (
    <Container>
      <Row className="py-4">
     {/*    <Col>
          <h1>Premium quality food</h1>
          <p className="fs-5">
            Indulge in an exquisite culinary journey at our restaurant, where
            every dish tells a story of flavor and passion. From tantalizing
            appetizers to mouthwatering mains and decadent desserts, our menu is
            crafted to delight your senses. Savor the finest ingredients sourced
            locally and globally.
          </p>
        </Col> */}
        <Col md="12">
          <img src="src\assets\img\pic.jpeg" alt="img" className="img-fluid" />
        </Col>
      </Row>
      <Row>
        <h3>Our Menu</h3>
        <Catalogue
          setSelectedCatalogueItem={setSelectedCatalogueItem}
          setMeals={setMeals}
        />
      </Row>
        <Menu meals={meals} />
    </Container>
  );
};

export default Home;
