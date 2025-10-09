import React from 'react';
import { CFormLabel, CFormInput } from '@coreui/react';

const DatePicker = ({ id, label, value, onChange, ...props }) => (
  <div className="mb-3">
    {label && <CFormLabel htmlFor={id}>{label}</CFormLabel>}
    <CFormInput
      id={id}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  </div>
);

export default DatePicker;
