import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AddUpdateForm from './AddUpdateForm';

const UpdateCarForm = ({
  currentCar, setUpdating, updateCar,
}) => {
  const [car, setCar] = useState(currentCar);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCar({ ...car, [name]: value });
  };

  useEffect(() => {
    setCar(currentCar);
  }, [currentCar]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        updateCar(car);
      }}
    >
      <AddUpdateForm
        car={car}
        handleInputChange={handleInputChange}
      />
      <button type="submit" className="button add-button">Update car</button>
      <button
        type="submit"
        onClick={() => {
          setUpdating(false);
        }}
        className="button cancel-button"
      >
        Cancel
      </button>
    </form>
  );
};


UpdateCarForm.propTypes = {
  currentCar: PropTypes.shape({
    id: PropTypes.string,
    brand: PropTypes.string,
    country: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.string,
    serialNum: PropTypes.string,
    description: PropTypes.string,
  }),
  setUpdating: PropTypes.func,
  updateCar: PropTypes.func,
};

export default UpdateCarForm;
