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
      // Enviar multipart si hay archivos
      const hasFile = pagoData && (pagoData.comprobante instanceof File);
      if (hasFile) {
        const form = new FormData();
        Object.entries(pagoData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, v);
        });
        const response = await apiClient.post('/pagos/', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      }
      const response = await apiClient.post('/pagos/', pagoData);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al registrar el pago'));
    }
  },

  async updatePago(id, pagoData) {
    try {
      const hasFile = pagoData && (pagoData.comprobante instanceof File);
      if (hasFile) {
        const form = new FormData();
        Object.entries(pagoData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, v);
        });
        const response = await apiClient.put(`/pagos/${id}/`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      }
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

  async aplicarPagoFactura(facturaId, pagoData) {
    try {
      const response = await apiClient.post(`/pagos/facturas/${facturaId}/pagos/`, pagoData);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al aplicar el pago a la factura'));
    }
  },

  async getDashboard(filters = {}) {
    try {
      const response = await apiClient.get('/pagos/dashboard/', {
        params: buildParams(filters)
      });
      return response.data;
    } catch (error) {
      console.warn('No se pudo obtener el dashboard de pagos, usando datos simulados.');
      return {
        estadisticas_generales: { total_pagos: 0, monto_total: 0 },
        pagos_mes_actual: { cantidad: 0, monto: 0 },
        pagos_por_metodo: {},
        tendencia_semanal: [],
      };
    }
  },

  async exportarReporte(filters = {}, formato = 'excel') {
    try {
      const response = await apiClient.get('/pagos/exportar/', {
        params: { ...buildParams(filters), formato },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      // Backend responde CSV (aunque se solicite 'excel')
      const extension = 'csv';
      link.setAttribute('download', `reporte_pagos_${Date.now()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al exportar el reporte de pagos'));
    }
  },

  async getResumenPorCliente(clienteId, filters = {}) {
    try {
      const response = await apiClient.get(`/pagos/cliente/${clienteId}/resumen/`, {
        params: buildParams(filters)
      });
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Error al obtener el resumen de pagos del cliente'));
    }
  }
};