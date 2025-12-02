import React from 'react';
import PropTypes from 'prop-types';

const NONE = 'NONE';
const ASC = 'asc';
const DESC = 'desc';


const SortableTH = ({
  doSort, sortAttribute, sortOrder, title,
}) => {
  const clickHandle = () => {
    doSort(title, sortOrder);
  };
  const resolveIcon = () => {
    if (title !== sortAttribute || sortOrder === NONE) {
      return <span className="sortIcon">&#x2195;</span>;
    }
    if (sortOrder === ASC) {
      return <span>&#x2191;</span>;
    } // DESC:
    return <span>&#x2193;</span>;
  };

  return (
    <>
      <th
        className="sortPointer"
        onClick={clickHandle}
      >
        {title}
        {resolveIcon()}
      </th>
    </>
  );
};

SortableTH.propTypes = {
  doSort: PropTypes.func,
  sortAttribute: PropTypes.string,
  sortOrder: PropTypes.string,
  title: PropTypes.string,
};

export default SortableTH;
export { ASC, DESC, NONE };
