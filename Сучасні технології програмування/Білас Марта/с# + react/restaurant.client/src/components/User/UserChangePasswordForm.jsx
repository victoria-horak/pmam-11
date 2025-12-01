import React from "react";
import { Row, Col, Button, Form, FloatingLabel } from "react-bootstrap";
import { Formik } from "formik";

import "./UserInfo.css"
import { useAuth } from "../../state/Auth/AuthContext";
import { UserPasswordValidationSchema } from "../../utils/validationSchema";
import { updateUserPassword } from "../../services/UserInfo";

const UserChangePasswordForm = () => {
  const { user } = useAuth();
  const initialValues = {
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  };

  const handleFormSubmit = async (values) => {
    try {
      const userInfo = {
        Email: user.email,
        OldPassword: values.oldPassword,
        NewPassword: values.newPassword,
      };
      const response = await updateUserPassword(userInfo);
      if (response.status === 200) {
        console.log("all is sucess");
      }
    } catch (error) {
      console.error("Error updating user password:", error);
    }
  };

  return (
    <Formik
      validationSchema={UserPasswordValidationSchema}
      initialValues={initialValues}
      onSubmit={(values) => {
        handleFormSubmit(values);
      }}
    >
      {({ handleSubmit, handleChange, values, errors }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Row className="pt-3">
            <Col>
              <FloatingLabel controlId="floatingName" label="old password">
                <Form.Control
                  type="password"
                  className="custom-input"
                  placeholder="old password"
                  name="oldPassword"
                  value={values.oldPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.oldPassword}
                />
              </FloatingLabel>
              <Form.Control.Feedback type="invalid">
                {errors.oldPassword}
              </Form.Control.Feedback>
            </Col>
          </Row>
          <Row>
            <Col>
              <FloatingLabel controlId="floatingSurname" label="new password">
                <Form.Control
                  className="custom-input"
                  type="password"
                  placeholder="new password"
                  name="newPassword"
                  value={values.newPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.newPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.newPassword}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>
          <Row className="pt-2 mb-5 pb-5">
            <Col>
              <FloatingLabel label="confirm new password">
                <Form.Control
                  type="password"
                  className="custom-input"
                  placeholder="confirm new password"
                  name="confirmNewPassword"
                  value={values.confirmNewPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.confirmNewPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmNewPassword}
                </Form.Control.Feedback>
              </FloatingLabel>
            </Col>
          </Row>
          <Row className=" mt-5 pt-5">
            <Col className="d-flex justify-content-center " xs="12">
              <Button type="submit" className="userInfo-submit-but mt-1" size="md">
                Change password
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default UserChangePasswordForm;
