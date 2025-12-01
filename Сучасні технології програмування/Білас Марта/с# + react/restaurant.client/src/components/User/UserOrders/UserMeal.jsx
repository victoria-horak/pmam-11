import React from 'react'
import { Row,Col } from 'react-bootstrap'

const UserMeal = ({ id, name, imageUrl, amount, weight }) => {
  return (
    <Row >
      <Col xs="4" className="d-flex justify-content-center align-items-center">
        <img src={imageUrl} alt="img" className="img-fluid cart-img" />
      </Col>
      <Col className="pb-1 mb-2" xs="4">
        <Row>
          <h6 className="p-0 m-0">{name}</h6>
        </Row>
        <Row className="text-muted pt-1">weight: {weight} g</Row>
        <Row className=" text-muted fs-6 ">amount: {amount} </Row>
      </Col> 
      <hr className='mt-2'/>
    </Row>
  )
}

export default UserMeal