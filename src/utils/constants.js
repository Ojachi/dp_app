/**
 * Constantes de la aplicación
 */

// Roles de usuario
export const USER_ROLES = {
  GERENTE: 'gerente',
  VENDEDOR: 'vendedor',
  DISTRIBUIDOR: 'distribuidor'
};

// Estados de factura
export const FACTURA_ESTADOS = {
  PENDIENTE: 'pendiente',
  PARCIAL: 'parcial',
  PAGADA: 'pagada',
  VENCIDA: 'vencida'
};

// Tipos de pago
export const TIPOS_PAGO = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque', label: 'Cheque' }
];

// Estados de alerta
export const ALERTA_ESTADOS = {
  NUEVA: 'nueva',
  LEIDA: 'leida',
  RESUELTA: 'resuelta'
};

// Tipos de alerta
export const TIPOS_ALERTA = {
  MONTO_ALTO: 'monto_alto',
  VENCIMIENTO: 'vencimiento',
  PAGO_RECIBIDO: 'pago_recibido'
};

// Configuración de paginación
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

// Configuración de auto-refresh
export const REFRESH_INTERVALS = {
  ALERTAS: 30000, // 30 segundos
  DASHBOARD: 60000, // 1 minuto
  FACTURAS: 300000 // 5 minutos
};

// Rutas de la aplicación
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  FACTURAS: '/facturas',
  PAGOS: '/pagos',
  ALERTAS: '/alertas',
  USUARIOS: '/usuarios',
  CLIENTES: '/clientes'
};

// Mensajes de la aplicación
export const MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada correctamente',
  LOGIN_ERROR: 'Credenciales incorrectas',
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
  SAVE_SUCCESS: 'Guardado correctamente',
  DELETE_SUCCESS: 'Eliminado correctamente',
  ERROR_GENERAL: 'Ocurrió un error inesperado',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  CONNECTION_ERROR: 'Error de conexión con el servidor'
};

// Configuración de validación
export const VALIDATION_RULES = {
  EMAIL: {
    required: 'El email es requerido',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Email inválido'
    }
  },
  PASSWORD: {
    required: 'La contraseña es requerida',
    minLength: {
      value: 6,
      message: 'La contraseña debe tener al menos 6 caracteres'
    }
  },
  REQUIRED: 'Este campo es requerido',
  PHONE: {
    pattern: {
      value: /^[0-9]{10}$/,
      message: 'Teléfono debe tener 10 dígitos'
    }
  },
  CURRENCY: {
    min: {
      value: 0,
      message: 'El valor debe ser mayor o igual a 0'
    }
  }
};