/**
 * Componente de tabla compatible con Bootstrap 5
 */
import React from 'react';

const Table = ({
  columns = [],
  data = [],
  renderCell,
  striped = false,
  bordered = false,
  hover = true,
  responsive = true,
  size = 'md',
  className = '',
  ...props
}) => {
  
  const sizeClasses = {
    sm: 'table-sm',
    md: '',
    lg: 'table-lg'
  };

  const tableClasses = [
    'table',
    striped ? 'table-striped' : '',
    bordered ? 'table-bordered' : '',
    hover ? 'table-hover' : '',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const TableComponent = (
    <table className={tableClasses} {...props}>
      <thead className="table-light">
        <tr>
          {columns.map((col) => (
            <th key={col.key || col.label} scope="col">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center py-4 text-muted">
              No hay datos para mostrar
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key || col.label}>
                  {renderCell ? renderCell(row, col) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (responsive) {
    return (
      <div className="table-responsive">
        {TableComponent}
      </div>
    );
  }

  return TableComponent;
};

export { Table };
export default Table;
