/**
 * Hook personalizado para gestión de pagos
 */
import { useState, useCallback } from 'react';
import { pagosService } from '../services/pagosService';

export const usePagos = () => {
  const [pagos, setPagos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar dashboard
  const loadDashboard = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await pagosService.getDashboard(filters);
      setDashboardData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar pagos con paginación
  const loadPagos = useCallback(async (filters = {}, page = 1, pageSize = 20) => {
    try {
      setLoading(true);
      setError(null);
      const response = await pagosService.getPagos({
        ...filters,
        page,
        page_size: pageSize
      });
      setPagos(response.results || []);
      return response;
    } catch (err) {
      setError(err.message);
      setPagos([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear pago
  const createPago = useCallback(async (pagoData) => {
    try {
      setLoading(true);
      setError(null);
      const newPago = await pagosService.createPago(pagoData);
      return newPago;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar pago
  const updatePago = useCallback(async (id, pagoData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedPago = await pagosService.updatePago(id, pagoData);
      
      // Actualizar en la lista local
      setPagos(prev => prev.map(pago => 
        pago.id === id ? { ...pago, ...updatedPago } : pago
      ));
      
      return updatedPago;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar pago
  const deletePago = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await pagosService.deletePago(id);
      
      // Remover de la lista local
      setPagos(prev => prev.filter(pago => pago.id !== id));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener facturas pendientes
  const loadFacturasPendientes = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await pagosService.getFacturasPendientes(filters);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Aplicar pago a factura
  const aplicarPagoFactura = useCallback(async (facturaId, pagoData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await pagosService.aplicarPagoFactura(facturaId, pagoData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar reporte
  const exportarReporte = useCallback(async (filters = {}, formato = 'excel') => {
    try {
      setLoading(true);
      setError(null);
      const result = await pagosService.exportarReporte(filters, formato);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estado
    pagos,
    dashboardData,
    loading,
    error,
    
    // Acciones
    loadDashboard,
    loadPagos,
    createPago,
    updatePago,
    deletePago,
    loadFacturasPendientes,
    aplicarPagoFactura,
    exportarReporte,
    
    // Utilidades
    clearError: () => setError(null),
    setPagos
  };
};