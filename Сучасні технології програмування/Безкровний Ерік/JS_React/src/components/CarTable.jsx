import React, { useState } from 'react';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import DeleteButton from './DeleteButton';
import SortableTH, { ASC, DESC, NONE } from './SortableTH';
import UpdatedTableRow from './UpdatedTableRow';

const CarTable = ({
  cars, currentCarSerNum, deleteCar, updating, updateRow,
}) => {
  const [sortOrder, setSortOrder] = useState(NONE);
  const [sortAttribute, setSortAttribute] = useState(NONE);

  const doSort = (thTitle, thOrder) => {
    if (thTitle !== sortAttribute) {
      setSortOrder(ASC);
    } else if (thOrder === NONE) {
      setSortOrder(ASC);
    } else if (thOrder === ASC) {
      setSortOrder(DESC);
    } else if (thOrder === DESC) {
      setSortOrder(NONE);
    }
    setSortAttribute(thTitle);
  };

  const toNumber = (value) => {
    if (isNaN(Number(value))) {
      return value;
    }
    return Number(value);
  };

  const getCarAttNum = (car) => {
    const attr = get(car, sortAttribute.toLowerCase());
    const ret = toNumber(attr);
    return ret;
  };

  const tableCars = sortOrder === NONE ? cars
    : (_.orderBy(cars, getCarAttNum, [sortOrder]));

  return (
    <table>
      <thead>
        <tr>
          <th />
          <SortableTH
            doSort={doSort}
            sortOrder={sortOrder}
            sortAttribute={sortAttribute}
            title="Brand"
          />
          <SortableTH
            doSort={doSort}
            sortOrder={sortOrder}
            sortAttribute={sortAttribute}
            title="Country"
          />
          <SortableTH
            doSort={doSort}
            sortOrder={sortOrder}
            sortAttribute={sortAttribute}
            title="Model"
          />
          <SortableTH
            doSort={doSort}
            sortOrder={sortOrder}
            sortAttribute={sortAttribute}
            title="Year"
          />
          <th>Serial Number</th>
          <SortableTH
            doSort={doSort}
            sortOrder={sortOrder}
            sortAttribute={sortAttribute}
            title="Description"
          />
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tableCars.length > 0 ? (
          tableCars.map((car) => (
            <tr key={car.id}>
              <UpdatedTableRow
                car={car}
                currentCarSerNum={currentCarSerNum}
                sortAttribute={sortAttribute}
                updating={updating}
                updateRow={updateRow}
              />
              <DeleteButton
                carId={car.id}
                deleteCar={deleteCar}
              />
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3}>No cars </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

CarTable.propTypes = {
  cars: PropTypes.arrayOf(PropTypes.object),
  updating: PropTypes.bool,
  updateRow: PropTypes.func,
  deleteCar: PropTypes.func,
  currentCarSerNum: PropTypes.string,
};

export default CarTable;
