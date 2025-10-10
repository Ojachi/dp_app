/**
 * Componente DataCard para mostrar información estructurada
 */
import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const DataCard = ({
  title,
  subtitle,
  value,
  prefix,
  suffix,
  icon,
  color = 'primary',
  size = 'md',
  loading = false,
  trend = null,
  onClick,
  className = '',
  children,
  footer,
  actions,
  ...props
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-5'
    };
    return sizes[size] || sizes.md;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return <i className="fas fa-arrow-up text-success ms-2"></i>;
    } else if (trend < 0) {
      return <i className="fas fa-arrow-down text-danger ms-2"></i>;
    }
    return <i className="fas fa-minus text-muted ms-2"></i>;
  };

  const getTrendText = () => {
    if (!trend) return null;
    
    const color = trend > 0 ? 'success' : trend < 0 ? 'danger' : 'muted';
    
    return (
      <small className={`text-${color} d-block mt-1`}>
        {trend > 0 ? '+' : ''}{trend}% respecto al período anterior
      </small>
    );
  };

  const cardClasses = [
    'card h-100',
    onClick ? 'cursor-pointer card-hover' : '',
    `border-${color}`,
    className
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className={cardClasses} {...props}>
        <div className={getSizeClasses()}>
          <LoadingSpinner size="sm" message="Cargando..." />
        </div>
      </div>
    );
  }

  return (
    <div className={cardClasses} onClick={onClick} {...props}>
      <div className={getSizeClasses()}>
        {/* Header */}
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="flex-grow-1">
            {title && (
              <h6 className={`card-title mb-1 text-${color}`}>
                {title}
              </h6>
            )}
            {subtitle && (
              <p className="card-subtitle text-muted small mb-0">
                {subtitle}
              </p>
            )}
          </div>
          
          {icon && (
            <div className={`text-${color} opacity-75`}>
              {typeof icon === 'string' ? (
                <i className={`${icon} fs-4`}></i>
              ) : (
                icon
              )}
            </div>
          )}
        </div>

        {/* Value */}
        {value !== undefined && (
          <div className="mb-2">
            <div className="d-flex align-items-baseline">
              {prefix && (
                <span className="text-muted me-1">{prefix}</span>
              )}
              
              <span className={`fs-2 fw-bold text-${color}`}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              
              {suffix && (
                <span className="text-muted ms-1">{suffix}</span>
              )}
              
              {getTrendIcon()}
            </div>
            
            {getTrendText()}
          </div>
        )}

        {/* Children (contenido personalizado) */}
        {children}

        {/* Actions */}
        {actions && (
          <div className="mt-3 d-flex gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className={`card-footer bg-transparent border-${color} border-opacity-25`}>
          {footer}
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .card-hover {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

// Variantes específicas para casos comunes
export const MetricCard = ({ 
  title, 
  value, 
  trend, 
  icon, 
  color = 'primary',
  format = 'number',
  ...props 
}) => {
  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
      }).format(val);
    }
    if (format === 'percentage') {
      return `${val}%`;
    }
    return val;
  };

  return (
    <DataCard
      title={title}
      value={formatValue(value)}
      trend={trend}
      icon={icon}
      color={color}
      {...props}
    />
  );
};

export const StatusCard = ({ 
  title, 
  status, 
  description, 
  icon,
  actions,
  ...props 
}) => {
  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'danger',
      pending: 'warning',
      completed: 'success',
      cancelled: 'secondary',
      processing: 'primary'
    };
    return colors[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      active: 'Activo',
      inactive: 'Inactivo',
      pending: 'Pendiente',
      completed: 'Completado',
      cancelled: 'Cancelado',
      processing: 'Procesando'
    };
    return texts[status] || status;
  };

  return (
    <DataCard
      title={title}
      color={getStatusColor(status)}
      icon={icon}
      actions={actions}
      {...props}
    >
      <div className="mb-2">
        <span className={`badge bg-${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      </div>
      {description && (
        <p className="text-muted small mb-0">{description}</p>
      )}
    </DataCard>
  );
};

export const ProgressCard = ({ 
  title, 
  progress = 0, 
  total = 100,
  showPercentage = true,
  color = 'primary',
  ...props 
}) => {
  const percentage = Math.round((progress / total) * 100);

  return (
    <DataCard
      title={title}
      value={showPercentage ? `${percentage}%` : `${progress}/${total}`}
      color={color}
      {...props}
    >
      <div className="progress mt-2" style={{ height: '8px' }}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </DataCard>
  );
};

export { DataCard };
export default DataCard;