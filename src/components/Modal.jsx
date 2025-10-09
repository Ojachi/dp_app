import React from "react";
import {
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
} from "@coreui/react";

const Modal = ({
  visible,
  onClose,
  title,
  children,
  footer,
  backdrop = "static",
  alignment = "center",
  ...props
}) => (
  <CModal
    alignment={alignment}
    backdrop={backdrop}
    visible={visible}
    onClose={onClose}
    aria-labelledby="modalTitle"
    {...props}
  >
    <CModalHeader>
      <CModalTitle id="modalTitle">{title}</CModalTitle>
    </CModalHeader>
    <CModalBody>{children}</CModalBody>
    {footer && <CModalFooter>{footer}</CModalFooter>}
  </CModal>
);

export default Modal;
