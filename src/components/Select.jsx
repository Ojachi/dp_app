import React from "react";
import { CFormSelect } from "@coreui/react";

const Select = ({ id, options, ...props }) => (
  <CFormSelect id={id} {...props}>
    {options &&
      options.map((opt, idx) => (
        <option
          key={opt.value !== undefined ? opt.value : idx}
          value={opt.value}
          disabled={opt.disabled}
        >
          {opt.label}
        </option>
      ))}
  </CFormSelect>
);

export default Select;
