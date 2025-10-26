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
      throw new Error('Error al obtener alertas'); 
    }
  },

  // Obtener contador de alertas nuevas
  async getContadorAlertas() {
    try {
      const response = await apiClient.get('/alertas/contador/');
      const data = response.data || {};
      // Normalizar forma: siempre exponer por_vencer y vencidas además de claves legacy
      const alertas_vencidas = data.alertas_vencidas ?? data.alertas_criticas ?? 0;
      const alertas_por_vencer = data.alertas_por_vencer ?? 0;
      const alertas_nuevas = data.alertas_nuevas ?? 0;
      return {
        alertas_nuevas,
        alertas_criticas: alertas_vencidas, // compatibilidad
        alertas_por_vencer,
        alertas_vencidas,
      };
    } catch (error) {
      // Datos de respaldo
      return { alertas_nuevas: 0, alertas_criticas: 0, alertas_por_vencer: 0, alertas_vencidas: 0 };
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

  // Marcar alerta como no leída
  async marcarNoLeida(id) {
    try {
      const response = await apiClient.patch(`/alertas/${id}/marcar-leida/`, { leida: false });
      return response.data;
    } catch (error) {
      throw new Error('Error al marcar alerta como no leída');
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

  // Helpers de conveniencia por subtipo
  async getAlertasPorVencer(extraFilters = {}) {
    return this.getAlertas({ subtipo: 'por_vencer', ...extraFilters });
  },

  async getAlertasVencidas(extraFilters = {}) {
    return this.getAlertas({ subtipo: 'vencida', ...extraFilters });
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
  }

  
};