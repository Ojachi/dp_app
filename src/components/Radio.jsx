import React from "react";
import { CFormCheck } from "@coreui/react";

const Radio = ({ name, options, label, ...props }) => (
  <div>
    {label && <span>{label}</span>}
    {options &&
      options.map((opt, idx) => (
        <CFormCheck
          type="radio"
          name={name}
          id={`${name}-${idx}`}
          label={opt.label}
          value={opt.value}
          {...props}
          key={opt.value !== undefined ? opt.value : idx}
        />
      ))}
  </div>
);

export default Radio;
