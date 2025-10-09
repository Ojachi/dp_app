import React from "react";
import { CButton } from "@coreui/react";

const Button = ({ color = "primary", onClick, children, ...props }) => (
  <CButton color={color} onClick={onClick} {...props}>
    {children}
  </CButton>
);

export default Button;
