/**
 * Servicios para gestión de facturas
 */
import apiClient from './api';

export const facturasService = {
  // Obtener todas las facturas (filtradas por rol)
  async getFacturas(filters = {}) {
    try {
      const params = {};
      const map = {
        // soportar nombres del UI -> API
        numero_factura: 'search',
        cliente: 'cliente',
        vendedor: 'vendedor',
        distribuidor: 'distribuidor',
        estado: 'estado',
        fecha_desde: 'fecha_desde',
        fecha_hasta: 'fecha_hasta',
        fecha_venc_desde: 'fecha_vencimiento__gte',
        fecha_venc_hasta: 'fecha_vencimiento__lte',
        valor_min: 'valor_total__gte',
        valor_max: 'valor_total__lte',
        // filtro rápido
        vencidas: 'vencidas',
        ordering: 'ordering',
        page: 'page',
        page_size: 'page_size',
      };

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          const apiKey = map[key] || key;
          // normalizar booleano de vencidas
          if (apiKey === 'vencidas') {
            params[apiKey] = String(Boolean(value));
          } else {
            params[apiKey] = value;
          }
        }
      });

      const response = await apiClient.get('/facturas/', { params });
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

  // Actualización parcial (PATCH): útil para estado_entrega u observaciones
  async patchFactura(id, partialData) {
    try {
      const response = await apiClient.patch(`/facturas/${id}/`, partialData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar parcialmente la factura');
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