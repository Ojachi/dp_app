/**
 * Servicios para gestión de pagos
 */
import apiClient from './api';

export const pagosService = {
  // Obtener todos los pagos
  async getPagos(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/pagos/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener pagos');
    }
  },

  // Registrar nuevo pago
  async createPago(pagoData) {
    try {
      const response = await apiClient.post('/pagos/', pagoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al registrar el pago');
    }
  },

  // Obtener pagos de una factura específica
  async getPagosByFactura(facturaId) {
    try {
      const response = await apiClient.get(`/pagos/factura/${facturaId}/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener pagos de la factura');
    }
  },

  // Obtener dashboard de pagos
  async getDashboard() {
    try {
      const response = await apiClient.get('/pagos/dashboard/');
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener dashboard de pagos');
    }
  }
};