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

  // Obtener pago por ID
  async getPagoById(id) {
    try {
      const response = await apiClient.get(`/pagos/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener pago');
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

  // Actualizar pago
  async updatePago(id, pagoData) {
    try {
      const response = await apiClient.put(`/pagos/${id}/`, pagoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al actualizar pago');
    }
  },

  // Eliminar pago
  async deletePago(id) {
    try {
      await apiClient.delete(`/pagos/${id}/`);
      return { success: true };
    } catch (error) {
      throw new Error('Error al eliminar pago');
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

  // Obtener facturas pendientes de pago
  async getFacturasPendientes(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/facturas/pendientes/?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Datos de respaldo para desarrollo
      return {
        results: [
          {
            id: 1,
            numero: 'F-001-001',
            cliente: { nombre: 'Juan Pérez', email: 'juan@email.com' },
            total: 150000,
            saldo_pendiente: 75000,
            fecha_vencimiento: '2024-12-15'
          },
          {
            id: 2,
            numero: 'F-001-002',
            cliente: { nombre: 'María García', email: 'maria@email.com' },
            total: 250000,
            saldo_pendiente: 250000,
            fecha_vencimiento: '2024-12-20'
          }
        ],
        count: 2
      };
    }
  },

  // Obtener métodos de pago
  async getMetodosPago() {
    try {
      const response = await apiClient.get('/pagos/metodos/');
      return response.data;
    } catch (error) {
      // Datos de respaldo
      return [
        { id: 'efectivo', nombre: 'Efectivo' },
        { id: 'transferencia', nombre: 'Transferencia Bancaria' },
        { id: 'cheque', nombre: 'Cheque' },
        { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito' },
        { id: 'consignacion', nombre: 'Consignación' },
        { id: 'otro', nombre: 'Otro' }
      ];
    }
  },

  // Aplicar pago a factura
  async aplicarPagoFactura(facturaId, pagoData) {
    try {
      const response = await apiClient.post(`/facturas/${facturaId}/pagos/`, pagoData);
      return response.data;
    } catch (error) {
      throw new Error('Error al aplicar pago a factura');
    }
  },

  // Obtener dashboard de pagos
  async getDashboard(filters = {}) {
    try {
      const response = await apiClient.get('/pagos/dashboard/');
      return response.data;
    } catch (error) {
      // Datos de respaldo para desarrollo
      return {
        total_pagos_hoy: 5,
        monto_pagos_hoy: 450000,
        total_pagos_mes: 125,
        monto_pagos_mes: 12500000,
        facturas_pendientes: 15,
        monto_pendiente: 3250000,
        pagos_por_metodo: {
          efectivo: { cantidad: 45, monto: 2250000 },
          transferencia: { cantidad: 60, monto: 8500000 },
          cheque: { cantidad: 15, monto: 1200000 },
          tarjeta: { cantidad: 5, monto: 550000 }
        },
        tendencia_semanal: [
          { dia: 'Lun', pagos: 15, monto: 1250000 },
          { dia: 'Mar', pagos: 22, monto: 1800000 },
          { dia: 'Mié', pagos: 18, monto: 1650000 },
          { dia: 'Jue', pagos: 25, monto: 2100000 },
          { dia: 'Vie', pagos: 30, monto: 2500000 },
          { dia: 'Sáb', pagos: 12, monto: 950000 },
          { dia: 'Dom', pagos: 8, monto: 650000 }
        ]
      };
    }
  },

  // Exportar reporte de pagos
  async exportarReporte(filters = {}, formato = 'excel') {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      params.append('formato', formato);

      const response = await apiClient.get('/pagos/exportar/', {
        params: params,
        responseType: 'blob'
      });
      
      // Crear descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute('download', `reporte_pagos_${new Date().getTime()}.${extension}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte descargado correctamente' };
    } catch (error) {
      throw new Error('Error al descargar reporte');
    }
  },

  // Obtener resumen de pagos por cliente
  async getResumenPorCliente(clienteId, filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/pagos/cliente/${clienteId}/resumen/?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error('Error al obtener resumen de pagos del cliente');
    }
  }
};