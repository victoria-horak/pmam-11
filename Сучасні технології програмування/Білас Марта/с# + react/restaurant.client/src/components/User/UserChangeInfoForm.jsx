import React from "react";
import { Row, Col, Button, Form, FloatingLabel } from "react-bootstrap";
import { Formik } from "formik";

import { updateUserInfo } from "../../services/UserInfo";
import { useAuth } from "../../state/Auth/AuthContext";
import { UserInfoValidationSchema } from "../../utils/validationSchema";

const UserInfoForm = () => {
  const { user } = useAuth();
  const initialValues = {
    name: user?.firstName || "",
    surname: user?.lastName || "",
    address: user?.address || "",
    phone: user?.phoneNumber || "",
    email: user?.email || "",
  };
  const handleFormSubmit = async (values) => {
    try {
      const userInfo = {
        Email: user.email,
        NewEmail: values.email,
        FirstName: values.name,
        LastName: values.surname,
        Address: values.address,
        PhoneNumber: values.phone,
      };
      const response = await updateUserInfo(userInfo);
      if (response.status === 200) {
        console.log("all is sucess");
      }
    } catch (error) {
      console.error("Error uptading user info:", error);
    }
  };
  return (
    <Formik
      validationSchema={UserInfoValidationSchema}
      initialValues={initialValues}
      onSubmit={(values) => {
        handleFormSubmit(values);
      }}
    >
      {({ handleSubmit, handleChange, values, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="pt-3">
            <Col>
              <FloatingLabel controlId="floatingName" label="name">
                <Form.Control
                  type="text"
                  className="custom-input"
                  placeholder="name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  isInvalid={!!errors.name}
                />
              </FloatingLabel>
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Col>
          </Row>
          <Row>
            <Col>
              <FloatingLabel controlId="floatingSurname" label="surname">
                <Form.Control
                  className="custom-input"
                  type="text"
                  placeholder="surname"
                  name="surname"
                  value={values.surname}
                  onChange={handleChange}
                  isInvalid={!!errors.surname}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.surname}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>
          <Row className="pt-2">
            <Col>
              <FloatingLabel label="address">
                <Form.Control
                  type="text"
                  className="custom-input"
                  placeholder="address"
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>
          <Row>
            <Col>
              <FloatingLabel label="phone">
                <Form.Control
                  type="text"
                  className="custom-input"
                  placeholder="phone"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>
          <Row className="pt-2 align-items-end">
            <Col>
              <FloatingLabel label="email">
                <Form.Control
                  type="email"
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
          </Row>
          <Row className="pt-4">
            <Col className="d-flex justify-content-center">
              <Button type="submit" className="userInfo-submit-but" size="md">
                Change info
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default UserInfoForm;
