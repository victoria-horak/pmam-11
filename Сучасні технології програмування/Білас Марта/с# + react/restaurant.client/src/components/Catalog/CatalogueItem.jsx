import React from 'react';
import { Col } from 'react-bootstrap';
import "./CatalogueItem.css";

const CatalogueItem = ({ id, name, imageUrl, onClick }) => {
  return (
    <Col lg="9" md="10" sm="6" xs="11" key={id}>
      <div className="category__item d-block align-items-center gap-3 " onClick={() => onClick(id)}>
        <div className="category__img">
          <img className="img-fluid" src={imageUrl} alt="category__item" />
        </div>
        <h5>{name}</h5>
      </div>
    </Col>
  );
}

export default CatalogueItem;
