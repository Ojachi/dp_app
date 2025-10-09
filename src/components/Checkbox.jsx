import React from "react";
import { CFormCheck } from "@coreui/react";

const Checkbox = ({ id, label, ...props }) => (
  <CFormCheck id={id} label={label} {...props} />
);

export default Checkbox;
