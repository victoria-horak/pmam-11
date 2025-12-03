import React from 'react';
import PropTypes from 'prop-types';

const UpdatedTableRow = ({
  car, currentCarSerNum, updating, updateRow,
}) => {
  const clickHandle = () => {
    updateRow(car);
  };

  const keyDownHandle = () => {
    updateRow(car);
  };

  return (
    <>
      <td>{car.serialNum === currentCarSerNum && updating && <span> &#x270E;</span> }</td>
      <td
        onClick={clickHandle}
        onKeyDown={keyDownHandle}
        role="presentation"
      >
        {car.brand}
      </td>
      <td
        onClick={clickHandle}
        onKeyDown={keyDownHandle}
        role="presentation"
      >
        {car.country}
      </td>
      <td
        onClick={clickHandle}
        onKeyDown={keyDownHandle}
        role="presentation"
      >
        {car.model}
      </td>
      <td
        onClick={clickHandle}
        onKeyDown={keyDownHandle}
        role="presentation"
      >
        {car.year}
      </td>
      <td
        onClick={clickHandle}
        onKeyDown={keyDownHandle}
        role="presentation"
      >
        {car.serialNum}
      </td>
      <td
        onClick={clickHandle}
        onKeyDown={keyDownHandle}
        role="presentation"
      >
        {car.description}
      </td>
    </>
  );
};

UpdatedTableRow.propTypes = {
  car: PropTypes.shape({
    id: PropTypes.string,
    brand: PropTypes.string,
    country: PropTypes.string,
    model: PropTypes.string,
    year: PropTypes.string,
    serialNum: PropTypes.string,
    description: PropTypes.string,
  }),
  currentCarSerNum: PropTypes.string,
  updating: PropTypes.bool,
  updateRow: PropTypes.func,
};

export default UpdatedTableRow;
