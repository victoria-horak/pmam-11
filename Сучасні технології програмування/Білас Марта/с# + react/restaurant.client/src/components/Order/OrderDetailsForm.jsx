import React from "react";

import { placeOrder } from "../../services/CartService";
import CustomerInfoForm from "../../UIElements/CustomerInfoForm";

const OrderDetailsForm = (props) => {
  const handleOrderSubmit = async (values) => {
    try {
      const model = {
        name: values.name,
        surname: values.surname,
        address: values.address,
        phone: values.phone,
        email: values.email,
        paymentType: values.paymentType,
        additionalInfo: values.additionInfo,
      };
      const response = await placeOrder(model);
      if (response.status === 200) {
        props.handleOrderPlacing(true);
        props.handleNextButtonClick();
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <>
      <p className="fs-4 pt-0">Confirm order:</p>
    {/*   <div>
        <span className="mr-2">Maybe you already have an account? </span>
        <Link
          to="/login"
          className="d-inline fs-8 p-0"
          onClick={handleLogInClick}
        >
          (log in)
        </Link> 
      </div>*/}
      <CustomerInfoForm handleFormSubmit={handleOrderSubmit} componentType={"cart"} />
    </>
  );
};

export default OrderDetailsForm;
