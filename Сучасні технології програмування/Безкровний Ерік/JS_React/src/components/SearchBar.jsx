import React from 'react';
import PropTypes from 'prop-types';

const SearchBar = ({ searchText, setSearchText }) => {
  const handleChange = (event) => {
    const searchValue = event.target.value;
    setSearchText(searchValue);
  };

  return (
    <>
      <label>
        <input
          onChange={handleChange}
          placeholder="Search"
          type="text"
          value={searchText}
        />
      </label>
    </>
  );
};

SearchBar.propTypes = {
  searchText: PropTypes.string,
  setSearchText: PropTypes.func,
};

export default SearchBar;
