import React from 'react';
import PropTypes from 'prop-types';

const DeleteButton = ({ carId, deleteCar }) => (
  <td>
    <button type="button"
      className="button delete-button"
      onClick={() => {
        deleteCar(carId);
      }}
    >Delete
    </button>
  </td>
);

DeleteButton.propTypes = {
  carId: PropTypes.string,
  deleteCar: PropTypes.func,
};

export default DeleteButton;
