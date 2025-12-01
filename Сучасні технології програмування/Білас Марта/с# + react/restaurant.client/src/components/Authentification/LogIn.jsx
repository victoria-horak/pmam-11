import { React, useState } from "react";
import {
  Row,
  Col,
  Button,
  Form,
  FloatingLabel,
  Image,
} from "react-bootstrap";
import { Formik } from "formik";
import { SignInValidationSchema } from "../../utils/validationSchema";


const LogIn = ({handleLogIn, errorMessage}) => {

  return (
    <>
      <Row className="d-flex justify-content-center pt-1">
        <Image
          src="src\assets\img\login.png"
          alt="img"
          fluid
          className="authDraw-img"
        />
      </Row>
      <Formik
        validationSchema={SignInValidationSchema}
        initialValues={{
          email: "",
          password: "",
        }}
        onSubmit={(values) => {
          handleLogIn(values.email, values.password);
        }}
      >
        {({ handleSubmit, handleChange, values, errors }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Row className="pt-3">
              <Col>
                <FloatingLabel label="email">
                  <Form.Control
                    type="text"
                    className="custom-input"
                    placeholder="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
              <Col>
                <FloatingLabel label="password">
                  <Form.Control
                    type="password"
                    className="custom-input"
                    placeholder="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </FloatingLabel>
              </Col>
            </Row>
            {errorMessage && (
              <Row className="pt-3">
                <Col className="text-danger">
                  <i
                    className="fa-solid fa-circle-exclamation fa-sm pe-2"
                    style={{ color: '#dc3545' }}
                  ></i> 
                    {errorMessage}
                </Col>
              </Row>
            )}
            <Row className=" mt-5 pt-2">
              <Col className="d-flex justify-content-center">
                <Button type="submit" className="signUp-btn" size="md">
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default LogIn;
