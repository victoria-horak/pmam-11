import {React, useState} from "react";
import { Row, Image } from "react-bootstrap";

import "./SignUp.css";
import { signUp } from "../../services/UserService";
import CustomerInfoForm from "../../UIElements/CustomerInfoForm";

const SingUp = ({handleLogIn}) => {
  const [errorMessage, setErrorMessage]= useState(null)
  const handleCreateUser = async (values) => {
    try {
      const model = {
        firstName: values.name,
        lastName: values.surname,
        address: values.address,
        phoneNumber: values.phone,
        email: values.email,
        password: values.password,
      };
      const response = await signUp(model);
      if (response.status === 200) {
        console.log("sign up success");
        handleLogIn(values.email, values.password);
      }
    } catch (error) {
      setErrorMessage("There is user with such email");
      console.error("Sign up failed" + error);
    }
  };
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
      <CustomerInfoForm handleFormSubmit={handleCreateUser} componentType={"signUp"} errorMessage={errorMessage}/>
    </>
  );
};

export default SingUp;
