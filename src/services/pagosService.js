/**
 * Servicios para gestión de pagos
 */
import apiClient from './api';

const buildParams = (filters = {}) => {
  const params = {};
  const map = {
    search: 'search',
    ordering: 'ordering',
    page: 'page',
    page_size: 'page_size',
    fecha_desde: 'fecha_desde',
    fecha_hasta: 'fecha_hasta',
    tipo_pago: 'tipo_pago',
    factura: 'factura',
    cliente: 'cliente',
  };
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const apiKey = map[key] || key;
      params[apiKey] = value;
    }
  });
  return params;
};

const extractErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  if (!data) {
    return fallback;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (Array.isArray(data)) {
    return data.join(', ');
  }

  const messages = Object.entries(data)
    .map(([field, value]) => {
      if (Array.isArray(value)) {
        return `${field}: ${value.join(', ')}`;
      }
      return `${field}: ${value}`;
    })
    .filter(Boolean);

  return messages.join(' | ') || fallback;
};

export const pagosService = {
  async getPagos(filters = {}) {
    try {
      const response = await apiClient.get('/pagos/', {
        params: buildParams(filters)
      });
      const data = response.data || {};
      return {
        results: Array.isArray(data.results) ? data.results : data,
        count: data.count ?? (Array.isArray(data.results) ? data.results.length : Array.isArray(data) ? data.length : 0),
      };
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al obtener pagos'));
    }
  },

  async getPagoById(id) {
    try {
      const response = await apiClient.get(`/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al obtener el pago'));
    }
  },

  async createPago(pagoData) {
    try {
      const response = await apiClient.post('/pagos/', pagoData);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al registrar el pago'));
    }
  },

  async updatePago(id, pagoData) {
    try {
      const response = await apiClient.put(`/pagos/${id}/`, pagoData);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al actualizar el pago'));
    }
  },

  async confirmPago(id) {
    try {
      const response = await apiClient.post(`/pagos/${id}/confirmar/`, { confirmar: true });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al confirmar el pago'));
    }
  },

  async deletePago(id) {
    try {
      await apiClient.delete(`/pagos/${id}/`);
      return { success: true };
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al eliminar el pago'));
    }
  },

  async getPagosByFactura(facturaId) {
    try {
      const response = await apiClient.get(`/pagos/factura/${facturaId}/`);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al obtener pagos de la factura'));
    }
  },

  async getMetodosPago() {
    try {
      const response = await apiClient.get('/pagos/metodos/');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  async getCuentas() {
    try {
      const response = await apiClient.get('/pagos/cuentas/');
      return Array.isArray(response.data?.results) ? response.data.results : (response.data || []);
    } catch (error) {
      return [];
    }
  },

  async createCuenta(data) {
    try {
      const response = await apiClient.post('/pagos/cuentas/', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al crear cuenta de pago'));
    }
  },

  async updateCuenta(id, data) {
    try {
      const response = await apiClient.put(`/pagos/cuentas/${id}/`, data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al actualizar cuenta de pago'));
    }
  },

  async deleteCuenta(id) {
    try {
      await apiClient.delete(`/pagos/cuentas/${id}/`);
      return { success: true };
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al eliminar cuenta de pago'));
    }
  },

  async aplicarPagoFactura(facturaId, pagoData) {
    try {
      const response = await apiClient.post(`/pagos/facturas/${facturaId}/pagos/`, pagoData);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al aplicar el pago a la factura'));
    }
  }
};