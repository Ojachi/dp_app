import React from "react";
import { CPagination, CPaginationItem } from "@coreui/react";

const Pagination = ({ page, pageCount, onPageChange }) => (
  <CPagination>
    <CPaginationItem disabled={page === 1} onClick={() => onPageChange(page - 1)}>
      Anterior
    </CPaginationItem>
    {Array.from({ length: pageCount }).map((_, idx) => (
      <CPaginationItem
        key={idx + 1}
        active={page === idx + 1}
        onClick={() => onPageChange(idx + 1)}
      >
        {idx + 1}
      </CPaginationItem>
    ))}
    <CPaginationItem disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>
      Siguiente
    </CPaginationItem>
  </CPagination>
);

export default Pagination;
