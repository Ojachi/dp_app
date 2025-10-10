/**
 * Componente de paginación compatible con Bootstrap 5
 */
import React from 'react';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  size = 'md',
  disabled = false
}) => {
  
  if (totalPages <= 1) return null;

  const sizeClasses = {
    sm: 'pagination-sm',
    md: '',
    lg: 'pagination-lg'
  };

  const getVisiblePages = () => {
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);
    
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
    
    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Paginación">
      <ul className={`pagination ${sizeClasses[size]} justify-content-center mb-0`}>
        {/* First page */}
        {showFirstLast && currentPage > 1 && (
          <li className={`page-item ${disabled ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(1)}
              disabled={disabled}
              aria-label="Primera página"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
          </li>
        )}
        
        {/* Previous page */}
        {showPrevNext && (
          <li className={`page-item ${currentPage === 1 || disabled ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(currentPage - 1)}
              disabled={currentPage === 1 || disabled}
              aria-label="Página anterior"
            >
              <i className="fas fa-angle-left"></i>
            </button>
          </li>
        )}
        
        {/* Ellipsis for skipped pages at start */}
        {visiblePages[0] > 1 && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}
        
        {/* Visible page numbers */}
        {visiblePages.map((page) => (
          <li 
            key={page} 
            className={`page-item ${page === currentPage ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => handlePageClick(page)}
              disabled={disabled}
              aria-label={`Página ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}
        
        {/* Ellipsis for skipped pages at end */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <li className="page-item disabled">
            <span className="page-link">...</span>
          </li>
        )}
        
        {/* Next page */}
        {showPrevNext && (
          <li className={`page-item ${currentPage === totalPages || disabled ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(currentPage + 1)}
              disabled={currentPage === totalPages || disabled}
              aria-label="Página siguiente"
            >
              <i className="fas fa-angle-right"></i>
            </button>
          </li>
        )}
        
        {/* Last page */}
        {showFirstLast && currentPage < totalPages && (
          <li className={`page-item ${disabled ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => handlePageClick(totalPages)}
              disabled={disabled}
              aria-label="Última página"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </li>
        )}
      </ul>
      
      {/* Page info */}
      <div className="text-center mt-2">
        <small className="text-muted">
          Página {currentPage} de {totalPages}
        </small>
      </div>
    </nav>
  );
};

export { Pagination };
export default Pagination;
