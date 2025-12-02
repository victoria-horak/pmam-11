import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AddUpdateForm from './AddUpdateForm';

const AddCarForm = ({ addCar, initialFormState, setAdding }) => {
  const [car, setCar] = useState(initialFormState);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setCar({ ...car, [name]: value });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!car.brand || !car.country) return;
        addCar(car);
        setCar(initialFormState);
      }}
    >
      <AddUpdateForm
        car={car}
        handleInputChange={handleInputChange}
      />
      <button className="button add-button" type="submit">Add new car</button>
      <button
        className="button cancel-button"
        onClick={() => {
          setAdding(false);
        }}
        type="submit"
      >
        Cancel
      </button>
    </form>
  );
};

AddCarForm.propTypes = {
  addCar: PropTypes.func.isRequired,
  initialFormState: PropTypes.shape({
    id: PropTypes.string,
    brand: PropTypes.string,
    country: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.string,
    serialNum: PropTypes.string,
    description: PropTypes.string,
  }),
  setAdding: PropTypes.func,
};

export default AddCarForm;
