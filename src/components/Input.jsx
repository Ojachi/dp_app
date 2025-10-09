import React from "react";
import { CFormInput } from "@coreui/react";

const Input = ({ id, type = "text", placeholder, ...props }) => (
  <CFormInput id={id} type={type} placeholder={placeholder} {...props} />
);

export default Input;
