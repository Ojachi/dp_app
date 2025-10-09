import React from "react";
import { CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell } from "@coreui/react";

const Table = ({ columns, data, renderCell, ...props }) => (
  <CTable {...props}>
    <CTableHead>
      <CTableRow>
        {columns.map((col) => (
          <CTableHeaderCell key={col.key || col.label}>{col.label}</CTableHeaderCell>
        ))}
      </CTableRow>
    </CTableHead>
    <CTableBody>
      {data.map((row, idx) => (
        <CTableRow key={row.id || idx}>
          {columns.map((col) => (
            <CTableDataCell key={col.key || col.label}>
              {renderCell ? renderCell(row, col) : row[col.key]}
            </CTableDataCell>
          ))}
        </CTableRow>
      ))}
    </CTableBody>
  </CTable>
);

export default Table;
