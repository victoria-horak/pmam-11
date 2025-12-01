import React from "react";
import { Row, Col, Card, Image } from "react-bootstrap";
import { RiBankCardLine, RiCashLine } from "@remixicon/react";

import "./Info.css";

const Info = () => {
  return (
    <>
      <Row className="ps-5 ms-5 pt-5">
        <Col xs="5" className="text-center fs-3 pe-0">
          <img
            src="src\assets\img\restaurant_pic.jpeg"
            alt="img"
            className="img-fluid ratio ratio-4x3"
          />
        </Col>
        <Col
          xs="1"
          className="d-flex align-items-center justify-content-center p-0 m-0"
        >
          <div
            className="border-start border-4 p-0 m-0"
            style={{ height: "100%", borderColor: "red" }}
          ></div>
        </Col>
        <Col xs="5 ps-0 ms-0">
          <Row className="text-start">
            <h2>About Us</h2>
          </Row>
          <p className="fs-5 pt-2 text-start">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minima,
            ipsum obcaecati magni deleniti doloremque dolorem exercitationem
            labore sequi? Amet ducimus at eos dicta id! Asperiores deserunt
            repudiandae assumenda voluptate omnis. Lorem ipsum dolor sit amet
            consectetur adipisicing elit. Id impedit enim officiis, similique
            voluptas aspernatur alias earum soluta ratione accusantium eveniet
            voluptatum fugiat commodi molestias nam facere sed pariatur sint?
          </p>
          <p className="fs-5 text-start">
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minima,
            ipsum obcaecati magni deleniti doloremque dolorem exercitationem
            labore sequi? Amet ducimus at eos dicta id! Asperiores deserunt
            repudiandae assumenda voluptate omnis. Lorem ipsum dolor sit amet
            consectetur adipisicing elit.
          </p>
        </Col>
      </Row>
      <Row className="py-3">
        <h2>Why our delivery?</h2>
      </Row>
      <Row>
        <Col>
          <img src="src\assets\img\order.png" alt="" />
          <h3>Easy to order</h3>
          <p className="text-muted fs-5">
            You only need a few steps in ordering food
          </p>
        </Col>
        <Col>
          <img src="src\assets\img\delivery-bike.png" alt="" />
          <h3>Fast delivery</h3>
          <p className="text-muted fs-5">
            Delivery that is always in time (30 min), even faster and also free.
          </p>
        </Col>
        <Col>
          <img src="src\assets\img\good-quality.png" alt="" />
          <h3>Best quality</h3>
          <p className="text-muted fs-5">
            Not only fast, for us quality is also number one
          </p>
        </Col>
      </Row>
      <Row className="py-3">
        <h2>Contact details</h2>
      </Row>
      <Row>
        <Col>
          <img src="src\assets\img\map.png" alt="" />
          <h5>Our restaurant locations:</h5>
          <p className="text-muted fs-6">st.Zelena 126, Lviv, Ukraine</p>
          <p className="text-muted fs-6">st.Soborna 16, Lviv, Ukraine</p>
        </Col>
        <Col>
          <img src="src\assets\img\phone.png" alt="" />
          <h5>Phone numbers:</h5>
          <p className="text-muted fs-6">+380974628345</p>
          <p className="text-muted fs-6">+380634628345</p>
        </Col>
        <Col>
          <img src="src\assets\img\gmail.png" alt="" />
          <h5>Email:</h5>
          <p className="text-muted fs-6 pb-0">example@gmail.com</p>
          <p className="text-muted fs-6 mt-0">example@gmail.com</p>
        </Col>
        <Col>
          <img src="src\assets\img\clock.png" alt="" />
          <h5>Delivery time:</h5>
          <p className="text-muted fs-6">
            Monday-Saturday: 10:00 - 11:00 
          </p>
          <p className="text-muted fs-6">Sunday: Off day</p>
        </Col>
      </Row>
    </>
  );
};

export default Info;
