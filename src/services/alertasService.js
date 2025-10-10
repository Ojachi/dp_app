/**
 * Servicios para sistema de alertas
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
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener contador de alertas');
    }
  },

  // Marcar alerta como leída
  async marcarComoLeida(alertaId) {
    try {
      const response = await apiClient.put(`/alertas/${alertaId}/marcar_leida/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al marcar alerta como leída');
    }
  }
};