import React from "react";
import { Row, Col } from "react-bootstrap";

import UserInfoForm from "./UserChangeInfoForm";
import UserChangePasswordForm from "./UserChangePasswordForm";

const UserInfo = () => {
  return (
    <>
      <Row className=" pt-2 fs-5">
        <Col>Change any info you need and click submit</Col>
      </Row>
      <Row >
        <Col>
          <UserInfoForm />
        </Col>
        <Col>
          <UserChangePasswordForm />
        </Col>
      </Row>
    </>
  );
};

export default UserInfo;
