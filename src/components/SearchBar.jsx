import React from 'react';
import { CFormInput } from '@coreui/react';

const SearchBar = ({ value, onChange }) => (
  <CFormInput
    type="search"
    placeholder="Buscar en la tabla..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="mb-3"
  />
);

export default SearchBar;
