import { useState, useEffect, useCallback } from 'react';
import carteraService from '../services/carteraService';

export const useCartera = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para diferentes secciones
  const [resumen, setResumen] = useState(null);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState([]);
  const [detalleCliente, setDetalleCliente] = useState(null);
  const [estadisticasMora, setEstadisticasMora] = useState([]);
  const [proyeccionCobranza, setProyeccionCobranza] = useState([]);
  const [historialGestiones, setHistorialGestiones] = useState([]);

  // Filtros y paginación
  const [filtros, setFiltros] = useState({
    estado: '',
    cliente: '',
    montoMin: '',
    montoMax: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Cargar resumen de cartera
  const cargarResumen = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carteraService.getResumenCartera();
      setResumen(data);
    } catch (err) {
      setError('Error al cargar resumen de cartera: ' + err.message);
      console.error('Error cargarResumen:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar cuentas por cobrar
  const cargarCuentasPorCobrar = useCallback(async (nuevosFiltros = filtros) => {
    try {
      setLoading(true);
      setError(null);
      const data = await carteraService.getCuentasPorCobrar(nuevosFiltros);
      setCuentasPorCobrar(data.cuentas || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / prev.limit)
      }));
    } catch (err) {
      setError('Error al cargar cuentas por cobrar: ' + err.message);
      console.error('Error cargarCuentasPorCobrar:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Cargar detalle de cliente
  const cargarDetalleCliente = useCallback(async (clienteId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await carteraService.getDetalleCuenta(clienteId);
      setDetalleCliente(data);
    } catch (err) {
      setError('Error al cargar detalle del cliente: ' + err.message);
      console.error('Error cargarDetalleCliente:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar estadísticas de mora
  const cargarEstadisticasMora = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carteraService.getEstadisticasMora();
      setEstadisticasMora(data);
    } catch (err) {
      setError('Error al cargar estadísticas de mora: ' + err.message);
      console.error('Error cargarEstadisticasMora:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar proyección de cobranza
  const cargarProyeccionCobranza = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carteraService.getProyeccionCobranza();
      setProyeccionCobranza(data);
    } catch (err) {
      setError('Error al cargar proyección de cobranza: ' + err.message);
      console.error('Error cargarProyeccionCobranza:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar historial de gestiones
  const cargarHistorialGestiones = useCallback(async (clienteId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await carteraService.getHistorialGestiones(clienteId);
      setHistorialGestiones(data);
    } catch (err) {
      setError('Error al cargar historial de gestiones: ' + err.message);
      console.error('Error cargarHistorialGestiones:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar límite de crédito
  const actualizarLimiteCredito = useCallback(async (clienteId, nuevoLimite, observaciones) => {
    try {
      setLoading(true);
      setError(null);
      const result = await carteraService.actualizarLimiteCredito(clienteId, nuevoLimite, observaciones);
      
      // Actualizar el cliente en la lista si existe
      setCuentasPorCobrar(prev => 
        prev.map(cuenta => 
          cuenta.id === clienteId 
            ? { ...cuenta, limiteCredito: nuevoLimite }
            : cuenta
        )
      );

      // Actualizar detalle del cliente si está cargado
      if (detalleCliente && detalleCliente.id === clienteId) {
        setDetalleCliente(prev => ({
          ...prev,
          limiteCredito: nuevoLimite
        }));
      }

      return result;
    } catch (err) {
      setError('Error al actualizar límite de crédito: ' + err.message);
      console.error('Error actualizarLimiteCredito:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [detalleCliente]);

  // Registrar gestión de cobranza
  const registrarGestionCobranza = useCallback(async (clienteId, gestion) => {
    try {
      setLoading(true);
      setError(null);
      const result = await carteraService.registrarGestionCobranza(clienteId, gestion);
      
      // Recargar historial si es el mismo cliente
      if (historialGestiones.length > 0) {
        await cargarHistorialGestiones(clienteId);
      }

      return result;
    } catch (err) {
      setError('Error al registrar gestión: ' + err.message);
      console.error('Error registrarGestionCobranza:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [historialGestiones, cargarHistorialGestiones]);

  // Generar reporte
  const generarReporte = useCallback(async (filtrosReporte = {}) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await carteraService.generarReporteCartera(filtrosReporte);
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-cartera-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, mensaje: 'Reporte generado exitosamente' };
    } catch (err) {
      setError('Error al generar reporte: ' + err.message);
      console.error('Error generarReporte:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar estado de cuenta
  const enviarEstadoCuenta = useCallback(async (clienteId, email = null) => {
    try {
      setLoading(true);
      setError(null);
      const result = await carteraService.enviarEstadoCuenta(clienteId, email);
      return result;
    } catch (err) {
      setError('Error al enviar estado de cuenta: ' + err.message);
      console.error('Error enviarEstadoCuenta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Manejo de filtros
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    const filtrosActualizados = { ...filtros, ...nuevosFiltros };
    setFiltros(filtrosActualizados);
    cargarCuentasPorCobrar(filtrosActualizados);
  }, [filtros, cargarCuentasPorCobrar]);

  const limpiarFiltros = useCallback(() => {
    const filtrosVacios = {
      estado: '',
      cliente: '',
      montoMin: '',
      montoMax: ''
    };
    setFiltros(filtrosVacios);
    cargarCuentasPorCobrar(filtrosVacios);
  }, [cargarCuentasPorCobrar]);

  // Cambiar página
  const cambiarPagina = useCallback((nuevaPagina) => {
    setPagination(prev => ({ ...prev, page: nuevaPagina }));
  }, []);

  // Métricas calculadas
  const metricas = {
    cuentasEnMora: cuentasPorCobrar.filter(c => c.estado === 'En mora').length,
    cuentasAlDia: cuentasPorCobrar.filter(c => c.estado === 'Al día').length,
    montoTotalMora: cuentasPorCobrar
      .filter(c => c.estado === 'En mora')
      .reduce((sum, c) => sum + c.totalDeuda, 0),
    clienteConMayorDeuda: cuentasPorCobrar.length > 0 
      ? cuentasPorCobrar.reduce((max, c) => c.totalDeuda > max.totalDeuda ? c : max, cuentasPorCobrar[0])
      : null
  };

  // Estado de carga inicial
  useEffect(() => {
    cargarResumen();
    cargarCuentasPorCobrar();
    cargarEstadisticasMora();
    cargarProyeccionCobranza();
  }, [cargarResumen, cargarCuentasPorCobrar, cargarEstadisticasMora, cargarProyeccionCobranza]);

  return {
    // Estados
    loading,
    error,
    resumen,
    cuentasPorCobrar,
    detalleCliente,
    estadisticasMora,
    proyeccionCobranza,
    historialGestiones,
    filtros,
    pagination,
    metricas,

    // Acciones
    cargarResumen,
    cargarCuentasPorCobrar,
    cargarDetalleCliente,
    cargarEstadisticasMora,
    cargarProyeccionCobranza,
    cargarHistorialGestiones,
    actualizarLimiteCredito,
    registrarGestionCobranza,
    generarReporte,
    enviarEstadoCuenta,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,

    // Utilidades
    setError: (mensaje) => setError(mensaje),
    limpiarError: () => setError(null),
    limpiarDetalleCliente: () => setDetalleCliente(null)
  };
};