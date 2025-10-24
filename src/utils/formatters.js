/**
 * Utilidades para formateo de datos
 */

// Formatear moneda colombiana
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount);
};

// Formatear fechas
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  return new Date(date).toLocaleDateString('es-CO', defaultOptions);
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Obtener badge de estado de factura
export const getEstadoBadge = (estado) => {
  const badges = {
    pendiente: { text: 'Pendiente', class: 'bg-warning text-dark' },
    parcial: { text: 'Pago Parcial', class: 'bg-info' },
    pagada: { text: 'Pagada', class: 'bg-success' },
    vencida: { text: 'Vencida', class: 'bg-danger' },
    anulada: { text: 'Anulada', class: 'bg-secondary' },
    entregado: { text: 'Entregado', class: 'bg-success' },
    devolucionTotal: { text: 'Devolución Total', class: 'bg-danger' }
  };
  
  return badges[estado] || { text: estado, class: 'bg-secondary' };
};

// Obtener badge de estado de entrega 
export const getEstadoEntregaBadge = (estadoEntrega) => {
  const badges = {
    pendiente: { text: 'Pendiente', class: 'bg-warning text-dark' },
    entregado: { text: 'Entregado', class: 'bg-success' },
    devolucion_total: { text: 'Devolución Total', class: 'bg-danger' }
  };

  return badges[estadoEntrega] || { text: estadoEntrega, class: 'bg-secondary' };
};

// Obtener badge de prioridad de alerta
export const getAlertaPrioridad = (esCritica, tipo) => {
  if (esCritica) {
    return { text: 'Crítica', class: 'bg-danger' };
  }
  
  const prioridades = {
    monto_alto: { text: 'Alta', class: 'bg-warning text-dark' },
    vencimiento: { text: 'Media', class: 'bg-info' },
    default: { text: 'Normal', class: 'bg-secondary' }
  };
  
  return prioridades[tipo] || prioridades.default;
};

// Calcular días de vencimiento
export const getDiasVencimiento = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;
  
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diffTime = vencimiento - hoy;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Obtener texto de estado de vencimiento
export const getEstadoVencimiento = (fechaVencimiento) => {
  const dias = getDiasVencimiento(fechaVencimiento);
  
  if (dias === null) return { text: '', class: '' };
  
  if (dias < 0) {
    return { text: `Vencida hace ${Math.abs(dias)} días`, class: 'text-danger' };
  } else if (dias === 0) {
    return { text: 'Vence hoy', class: 'text-warning' };
  } else if (dias <= 7) {
    return { text: `Vence en ${dias} días`, class: 'text-warning' };
  } else {
    return { text: `Vence en ${dias} días`, class: 'text-success' };
  }
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar número de teléfono colombiano
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Generar ID único
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};