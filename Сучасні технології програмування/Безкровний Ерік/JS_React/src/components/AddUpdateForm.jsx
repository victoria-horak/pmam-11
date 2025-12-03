import React from 'react';
import PropTypes from 'prop-types';


const AddUpdateForm = ({ car, handleInputChange }) => (
  <>
    <label>
      Brand
      <input
        name="brand"
        onChange={handleInputChange}
        type="text"
        value={car.brand}
      />
    </label>
    <label>
      Country
      <input
        name="country"
        onChange={handleInputChange}
        type="text"
        value={car.country}
      />
    </label>
    <label>
      Model
      <input
        name="model"
        onChange={handleInputChange}
        type="text"
        value={car.model}
      />
    </label>
    <label>
      Year
      <input
        name="year"
        onChange={handleInputChange}
        type="text"
        value={car.year}
      />
    </label>
    <label>
      Serial Number
      <input
        name="serialNum"
        onChange={handleInputChange}
        type="text"
        value={car.serialNum}
      />
    </label>
    <label>
      Description
      <input
        name="description"
        onChange={handleInputChange}
        type="text"
        value={car.description}
      />
    </label>
  </>
);

AddUpdateForm.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.string,
    brand: PropTypes.string,
    country: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.string,
    serialNum: PropTypes.string,
    description: PropTypes.string,
  }),
  handleInputChange: PropTypes.func,
};

export default AddUpdateForm;
