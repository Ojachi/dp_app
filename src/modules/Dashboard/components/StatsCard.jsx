/**
 * Componente de tarjeta de estadísticas reutilizable
 */
import React from 'react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'primary', 
  onClick,
  loading = false 
}) => {
  const cardClasses = `card h-100 border-0 shadow-sm ${onClick ? 'cursor-pointer hover-shadow' : ''}`;
  
  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '';
        }
      }}
    >
      <div className="card-body d-flex align-items-center">
        <div className="flex-grow-1">
          <div className="text-muted small mb-1">{title}</div>
          <div className={`h4 mb-0 text-${color}`}>
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              value
            )}
          </div>
          {subtitle && (
            <div className="text-muted small mt-1">{subtitle}</div>
          )}
        </div>
        <div className={`ms-3 text-${color}`}>
          <i className={`${icon} fa-2x opacity-75`}></i>
        </div>
      </div>
      {onClick && (
        <div className="card-footer bg-transparent border-0 pt-0">
          <small className={`text-${color}`}>
            <i className="fas fa-arrow-right me-1"></i>
            Ver detalles
          </small>
        </div>
      )}
    </div>
  );
};

export default StatsCard;