/**
 * Componente de tabla avanzado compatible con Bootstrap 5
 * Incluye: ordenamiento, selección, loading, empty states, acciones en lote
 */
import React, { useState, useMemo } from 'react';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  emptyIcon = 'fas fa-inbox',
  striped = false,
  bordered = false,
  hover = true,
  responsive = true,
  size = 'md',
  className = '',
  // Funcionalidades avanzadas
  sortable = false,
  selectable = false,
  onSelectionChange,
  selectedRows = [],
  onSort,
  sortConfig = null,
  stickyHeader = false,
  maxHeight = null,
  // Acciones en lote
  batchActions = [],
  onBatchAction,
  // Paginación interna (opcional)
  pagination = null,
  onRowClick,
  rowClassName,
  ...props
}) => {
  const [internalSortConfig, setInternalSortConfig] = useState(null);
  
  // Usar sortConfig externo o interno
  const activeSortConfig = sortConfig || internalSortConfig;
  
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

  // Función para manejar ordenamiento
  const handleSort = (column) => {
    if (!column.sortable && !sortable) return;
    
    let direction = 'asc';
    if (activeSortConfig?.key === column.key && activeSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const newSortConfig = { key: column.key, direction };
    
    if (onSort) {
      onSort(newSortConfig);
    } else {
      setInternalSortConfig(newSortConfig);
    }
  };

  // Datos ordenados (solo si no hay onSort externo)
  const sortedData = useMemo(() => {
    if (onSort || !activeSortConfig) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[activeSortConfig.key];
      const bVal = b[activeSortConfig.key];
      
      if (aVal < bVal) return activeSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return activeSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, activeSortConfig, onSort]);

  // Manejar selección
  const handleSelectAll = (checked) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? sortedData.map(row => row.id) : []);
    }
  };

  const handleSelectRow = (rowId) => {
    if (onSelectionChange) {
      const newSelection = selectedRows.includes(rowId)
        ? selectedRows.filter(id => id !== rowId)
        : [...selectedRows, rowId];
      onSelectionChange(newSelection);
    }
  };

  // Renderizar icono de ordenamiento
  const renderSortIcon = (column) => {
    if ((!column.sortable && !sortable) || !activeSortConfig || activeSortConfig.key !== column.key) {
      return <i className="fas fa-sort text-muted ms-1"></i>;
    }
    
    return activeSortConfig.direction === 'asc' 
      ? <i className="fas fa-sort-up text-primary ms-1"></i>
      : <i className="fas fa-sort-down text-primary ms-1"></i>;
  };

  // Componente de carga
  const LoadingComponent = () => (
    <tr>
      <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-5">
        <div className="d-flex flex-column align-items-center">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <span className="text-muted">Cargando datos...</span>
        </div>
      </td>
    </tr>
  );

  // Componente de estado vacío
  const EmptyComponent = () => (
    <tr>
      <td colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-5">
        <div className="d-flex flex-column align-items-center">
          <i className={`${emptyIcon} fa-3x text-muted mb-3`}></i>
          <h6 className="text-muted">{emptyMessage}</h6>
          <small className="text-muted">No se encontraron registros que mostrar</small>
        </div>
      </td>
    </tr>
  );

  const TableComponent = (
    <table className={tableClasses} {...props}>
      <thead className={`table-light ${stickyHeader ? 'sticky-top' : ''}`}>
        <tr>
          {selectable && (
            <th scope="col" style={{ width: '40px' }}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                indeterminate={selectedRows.length > 0 && selectedRows.length < sortedData.length}
              />
            </th>
          )}
          {columns.map((col) => {
            const headerContent = col.header !== undefined ? col.header : col.label;
            return (
              <th 
                key={col.key || col.label} 
                scope="col"
                className={`${(col.sortable || sortable) ? 'cursor-pointer user-select-none' : ''} ${col.headerClassName || ''}`}
                style={{ width: col.width, ...col.headerStyle }}
                onClick={() => handleSort(col)}
              >
                <div className="d-flex align-items-center">
                  {headerContent}
                  {(col.sortable || sortable) && renderSortIcon(col)}
                </div>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <LoadingComponent />
        ) : sortedData.length === 0 ? (
          <EmptyComponent />
        ) : (
          sortedData.map((row, idx) => (
            <tr 
              key={row.id || idx}
              className={`${rowClassName ? rowClassName(row) : ''} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {selectable && (
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleSelectRow(row.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td 
                  key={col.key || col.label}
                  className={col.cellClassName || ''}
                  style={col.cellStyle}
                >
                  {col.render ? col.render(row, col) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  // Acciones en lote
  const BatchActionsComponent = () => (
    selectedRows.length > 0 && batchActions.length > 0 && (
      <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
        <div>
          <strong>{selectedRows.length}</strong> elemento(s) seleccionado(s)
        </div>
        <div className="d-flex gap-2">
          {batchActions.map((action, index) => (
            <button
              key={index}
              className={`btn btn-sm ${action.variant || 'btn-outline-primary'}`}
              onClick={() => onBatchAction && onBatchAction(action.key, selectedRows)}
              disabled={action.disabled}
            >
              {action.icon && <i className={`${action.icon} me-1`}></i>}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    )
  );

  const TableContainer = () => {
    const containerProps = {
      className: responsive ? 'table-responsive' : '',
      style: maxHeight ? { maxHeight, overflowY: 'auto' } : {}
    };

    return (
      <div {...containerProps}>
        <BatchActionsComponent />
        {TableComponent}
        {pagination && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted">
              Mostrando {Math.min((pagination.currentPage - 1) * pagination.pageSize + 1, pagination.total)} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} de {pagination.total} registros
            </div>
            {pagination.onPageChange && (
              <div className="d-flex gap-1">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`btn btn-sm ${page === pagination.currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => pagination.onPageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return <TableContainer />;
};

export { Table };
export default Table;
