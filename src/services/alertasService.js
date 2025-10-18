/**
 * Servicios para sistema de alertas completo
 */
import apiClient from './api';

export const alertasService = {
  // Obtener alertas del usuario
  async getAlertas(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

  const response = await apiClient.get(`/alertas/?${params.toString()}`);
  return response.data;
    } catch (error) {
      // Datos de respaldo para desarrollo
      return {
        results: [
          {
            id: 1,
            titulo: 'Factura vencida F-001-123',
            mensaje: 'La factura F-001-123 del cliente María García venció hace 5 días. Saldo pendiente: $250,000',
            tipo: 'vencimiento',
            prioridad: 'alta',
            leida: false,
            fecha_creacion: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            fecha_leida: null,
            usuario: { id: 1, nombre: 'Sistema' },
            relacionado: {
              tipo: 'factura',
              id: 123,
              numero: 'F-001-123'
            }
          },
          {
            id: 2,
            titulo: 'Pago recibido',
            mensaje: 'Se ha recibido un pago de $150,000 para la factura F-001-120',
            tipo: 'pago',
            prioridad: 'media',
            leida: true,
            fecha_creacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            fecha_leida: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            usuario: { id: 2, nombre: 'Juan Pérez' },
            relacionado: {
              tipo: 'pago',
              id: 45,
              numero: 'P-045'
            }
          },
          {
            id: 3,
            titulo: 'Nueva factura creada',
            mensaje: 'Se ha creado la factura F-001-125 para el cliente Carlos López por $320,000',
            tipo: 'factura',
            prioridad: 'baja',
            leida: false,
            fecha_creacion: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            fecha_leida: null,
            usuario: { id: 3, nombre: 'Ana Rodríguez' },
            relacionado: {
              tipo: 'factura',
              id: 125,
              numero: 'F-001-125'
            }
          },
          {
            id: 4,
            titulo: 'Sistema de respaldo completado',
            mensaje: 'El respaldo automático de la base de datos se completó exitosamente',
            tipo: 'sistema',
            prioridad: 'baja',
            leida: true,
            fecha_creacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            fecha_leida: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
            usuario: { id: 1, nombre: 'Sistema' },
            relacionado: null
          },
          {
            id: 5,
            titulo: 'Cliente moroso detectado',
            mensaje: 'El cliente TechCorp tiene 3 facturas vencidas por un total de $850,000',
            tipo: 'cobranza',
            prioridad: 'alta',
            leida: false,
            fecha_creacion: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            fecha_leida: null,
            usuario: { id: 1, nombre: 'Sistema' },
            relacionado: {
              tipo: 'cliente',
              id: 15,
              nombre: 'TechCorp'
            }
          }
        ],
        count: 5
      };
    }
  },

  // Obtener contador de alertas nuevas
  async getContadorAlertas() {
    try {
      const response = await apiClient.get('/alertas/contador/');
      return response.data; // { alertas_nuevas, alertas_criticas }
    } catch (error) {
      // Datos de respaldo
      return { alertas_nuevas: 0, alertas_criticas: 0 };
    }
  },

  // Marcar alerta como leída
  async marcarComoLeida(alertaId) {
    try {
      const response = await apiClient.patch(`/alertas/${alertaId}/marcar-leida/`, { leida: true });
      return response.data;
    } catch (error) {
      throw new Error('Error al marcar alerta como leída');
    }
  },

  // Obtener alerta por ID
  async getAlertaById(id) {
    try {
      const response = await apiClient.get(`/alertas/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener alerta');
    }
  },

  // Crear nueva alerta
  async createAlerta(alertaData) {
    try {
      // Nota: El backend actual no expone creación directa de Alerta por usuarios.
      // Este endpoint fallará si no existe; se mantiene para compatibilidad y puede ocultarse en UI.
      const response = await apiClient.post('/alertas/', alertaData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear alerta');
    }
  },

  // Marcar alerta como no leída
  async marcarNoLeida(id) {
    try {
      const response = await apiClient.patch(`/alertas/${id}/marcar-leida/`, { leida: false });
      return response.data;
    } catch (error) {
      throw new Error('Error al marcar alerta como no leída');
    }
  },

  // Marcar múltiples alertas como leídas
  async marcarVariasLeidas(ids) {
    try {
      const response = await apiClient.patch('/alertas/leer-multiples/', { ids, leida: true });
      return response.data;
    } catch (error) {
      throw new Error('Error al marcar alertas como leídas');
    }
  },

  // Eliminar alerta
  async deleteAlerta(id) {
    try {
      // Backend no permite DELETE; actualizamos estado a 'descartada'
      const response = await apiClient.patch(`/alertas/${id}/`, { estado: 'descartada' });
      return { success: true, data: response.data };
    } catch (error) {
      throw new Error('Error al eliminar alerta');
    }
  },

  // Obtener tipos de alertas disponibles
  async getTiposAlertas() {
    try {
      const response = await apiClient.get('/alertas/tipos/');
      return response.data;
    } catch (error) {
      return [
        { id: 'vencimiento', nombre: 'Vencimiento', icono: 'fas fa-clock', color: 'warning' },
        { id: 'pago_parcial', nombre: 'Pago Parcial', icono: 'fas fa-money-bill', color: 'success' },
        { id: 'sin_pagos', nombre: 'Sin Pagos', icono: 'fas fa-bell', color: 'secondary' },
        { id: 'monto_alto', nombre: 'Monto Alto', icono: 'fas fa-exclamation-triangle', color: 'danger' },
        { id: 'custom', nombre: 'Personalizada', icono: 'fas fa-cog', color: 'info' }
      ];
    }
  },

  // Obtener alertas en tiempo real
  async getAlertasRecientes(ultimaFecha) {
    try {
      const params = ultimaFecha ? { desde: ultimaFecha } : undefined;
      const response = await apiClient.get('/alertas/recientes/', { params });
      return response.data;
    } catch (error) {
      return { results: [], count: 0 };
    }
  },

  // Obtener estadísticas de alertas
  async getEstadisticas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await apiClient.get(`/alertas/estadisticas/?${params.toString()}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Exportar reporte de alertas
  async exportarReporte(filtros = {}, formato = 'csv') {
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('formato', formato);

      const response = await apiClient.get('/alertas/exportar/', {
        params: params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = formato === 'xlsx' ? 'xlsx' : 'csv';
      link.setAttribute('download', `reporte_alertas_${new Date().getTime()}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte descargado correctamente' };
    } catch (error) {
      throw new Error('Error al descargar reporte');
    }
  }
};