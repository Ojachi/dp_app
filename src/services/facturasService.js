/**
 * Servicios para gestión de facturas
 */
import apiClient from './api';

export const facturasService = {
  // Obtener todas las facturas (filtradas por rol)
  async getFacturas(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/facturas/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener facturas');
    }
  },

  // Obtener factura por ID
  async getFacturaById(id) {
    try {
      const response = await apiClient.get(`/facturas/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener la factura');
    }
  },

  // Crear nueva factura
  async createFactura(facturaData) {
    try {
      const response = await apiClient.post('/facturas/', facturaData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al crear la factura');
    }
  },

  // Actualizar factura
  async updateFactura(id, facturaData) {
    try {
      const response = await apiClient.put(`/facturas/${id}/`, facturaData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar la factura');
    }
  },

  // Eliminar factura
  async deleteFactura(id) {
    try {
      await apiClient.delete(`/facturas/${id}/`);
      return true;
    } catch (error) {
      throw new Error('Error al eliminar la factura');
    }
  },

  // Obtener dashboard de facturas (solo gerentes)
  async getDashboard() {
    try {
      const response = await apiClient.get('/facturas/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener dashboard');
    }
  }
};