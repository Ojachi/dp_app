import { useState, useEffect, useCallback } from 'react';
import carteraService from '../services/carteraService';

const INITIAL_FILTERS = {
  estado: '',
  cliente: '',
  clienteId: '',
  montoMin: '',
  montoMax: ''
};

const buildErrorMessage = (prefix, err) => `${prefix}${err?.message ? `: ${err.message}` : ''}`;

export const useCartera = () => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [error, setErrorMessage] = useState(null);

  // Estados para diferentes secciones
  const [resumen, setResumen] = useState(null);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState([]);
  const [detalleCliente, setDetalleCliente] = useState(null);
  const [estadisticasMora, setEstadisticasMora] = useState([]);
  const [proyeccionCobranza, setProyeccionCobranza] = useState([]);
  const [historialGestiones, setHistorialGestiones] = useState([]);

  // Filtros y paginación
  const [filtros, setFiltros] = useState(() => ({ ...INITIAL_FILTERS }));
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const loading = loadingCount > 0;

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => Math.max(prev - 1, 0));
  }, []);

  const cargarResumen = useCallback(async () => {
    startLoading();
    setErrorMessage(null);
    try {
      const data = await carteraService.getResumenCartera();
      setResumen(data);
    } catch (err) {
      const message = buildErrorMessage('Error al cargar resumen de cartera', err);
      setErrorMessage(message);
      console.error('Error cargarResumen:', err);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const cargarCuentasPorCobrar = useCallback(async (nuevosFiltros = filtros, options = {}) => {
    const { resetPage = false } = options;
    startLoading();
    setErrorMessage(null);
    try {
      const data = await carteraService.getCuentasPorCobrar(nuevosFiltros);
      let cuentas = Array.isArray(data?.cuentas) ? data.cuentas : [];

      const searchTerm = (nuevosFiltros.cliente || '').toString().trim().toLowerCase();
      if (searchTerm) {
        cuentas = cuentas.filter((cuenta) => {
          const nombre = (cuenta.cliente || '').toLowerCase();
          const email = (cuenta.email || '').toLowerCase();
          const ruc = (cuenta.ruc || '').toLowerCase();
          return nombre.includes(searchTerm) || email.includes(searchTerm) || ruc.includes(searchTerm);
        });
      }

      if (nuevosFiltros.estado === 'vencida') {
        cuentas = cuentas.filter((cuenta) => cuenta.estado === 'En mora');
      } else if (nuevosFiltros.estado === 'aldia') {
        cuentas = cuentas.filter((cuenta) => cuenta.estado === 'Al día');
      }

      setCuentasPorCobrar(cuentas);
      setPagination((prev) => {
        const limit = prev.limit || 10;
        const totalPages = Math.max(1, Math.ceil(cuentas.length / limit));
        const page = resetPage ? 1 : Math.min(prev.page, totalPages);
        return {
          ...prev,
          total: cuentas.length,
          totalPages,
          page
        };
      });
    } catch (err) {
      const message = buildErrorMessage('Error al cargar cuentas por cobrar', err);
      setErrorMessage(message);
      console.error('Error cargarCuentasPorCobrar:', err);
    } finally {
      stopLoading();
    }
  }, [filtros, startLoading, stopLoading]);

  const cargarDetalleCliente = useCallback(async (clienteId) => {
    startLoading();
    setErrorMessage(null);
    try {
      const data = await carteraService.getDetalleCuenta(clienteId);
      setDetalleCliente(data);
    } catch (err) {
      const message = buildErrorMessage('Error al cargar detalle del cliente', err);
      setErrorMessage(message);
      console.error('Error cargarDetalleCliente:', err);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const cargarEstadisticasMora = useCallback(async () => {
    startLoading();
    setErrorMessage(null);
    try {
      const data = await carteraService.getEstadisticasMora();
      setEstadisticasMora(data);
    } catch (err) {
      const message = buildErrorMessage('Error al cargar estadísticas de mora', err);
      setErrorMessage(message);
      console.error('Error cargarEstadisticasMora:', err);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const cargarProyeccionCobranza = useCallback(async () => {
    startLoading();
    setErrorMessage(null);
    try {
      const data = await carteraService.getProyeccionCobranza();
      setProyeccionCobranza(data);
    } catch (err) {
      const message = buildErrorMessage('Error al cargar proyección de cobranza', err);
      setErrorMessage(message);
      console.error('Error cargarProyeccionCobranza:', err);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const cargarHistorialGestiones = useCallback(async (clienteId) => {
    startLoading();
    setErrorMessage(null);
    try {
      const data = await carteraService.getHistorialGestiones(clienteId);
      setHistorialGestiones(data);
    } catch (err) {
      const message = buildErrorMessage('Error al cargar historial de gestiones', err);
      setErrorMessage(message);
      console.error('Error cargarHistorialGestiones:', err);
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const actualizarLimiteCredito = useCallback(async (clienteId, nuevoLimite, observaciones) => {
    startLoading();
    setErrorMessage(null);
    try {
      const result = await carteraService.actualizarLimiteCredito(clienteId, nuevoLimite, observaciones);

      setCuentasPorCobrar((prev) =>
        prev.map((cuenta) =>
          cuenta.id === clienteId
            ? { ...cuenta, limiteCredito: result?.limiteCredito ?? nuevoLimite }
            : cuenta
        )
      );

      if (detalleCliente && detalleCliente.id === clienteId) {
        setDetalleCliente((prev) => ({
          ...prev,
          limiteCredito: result?.limiteCredito ?? nuevoLimite
        }));
      }

      return result;
    } catch (err) {
      const message = buildErrorMessage('Error al actualizar límite de crédito', err);
      setErrorMessage(message);
      console.error('Error actualizarLimiteCredito:', err);
      throw err;
    } finally {
      stopLoading();
    }
  }, [detalleCliente, startLoading, stopLoading]);

  const registrarGestionCobranza = useCallback(async (clienteId, gestion) => {
    startLoading();
    setErrorMessage(null);
    try {
      const result = await carteraService.registrarGestionCobranza(clienteId, gestion);

      if (historialGestiones.length > 0) {
        await cargarHistorialGestiones(clienteId);
      } else if (result) {
        setHistorialGestiones((prev) => [result, ...prev]);
      }

      return result;
    } catch (err) {
      const message = buildErrorMessage('Error al registrar gestión', err);
      setErrorMessage(message);
      console.error('Error registrarGestionCobranza:', err);
      throw err;
    } finally {
      stopLoading();
    }
  }, [historialGestiones.length, cargarHistorialGestiones, startLoading, stopLoading]);

  const generarReporte = useCallback(async (filtrosReporte = {}) => {
    startLoading();
    setErrorMessage(null);
    try {
      const blob = await carteraService.generarReporteCartera(filtrosReporte);
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
      const message = buildErrorMessage('Error al generar reporte', err);
      setErrorMessage(message);
      console.error('Error generarReporte:', err);
      throw err;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const enviarEstadoCuenta = useCallback(async (clienteId, email = null) => {
    startLoading();
    setErrorMessage(null);
    try {
      const result = await carteraService.enviarEstadoCuenta(clienteId, email);
      return result;
    } catch (err) {
      const message = buildErrorMessage('Error al enviar estado de cuenta', err);
      setErrorMessage(message);
      console.error('Error enviarEstadoCuenta:', err);
      throw err;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  const actualizarFiltros = useCallback((nuevosFiltros) => {
    const nextFilters = { ...filtros, ...nuevosFiltros };
    if (Object.prototype.hasOwnProperty.call(nuevosFiltros, 'cliente')) {
      const term = (nuevosFiltros.cliente || '').toString().trim();
      nextFilters.cliente = term;
      nextFilters.clienteId = /^\d+$/.test(term) ? term : '';
    }
    setFiltros(nextFilters);
    cargarCuentasPorCobrar(nextFilters, { resetPage: true });
  }, [filtros, cargarCuentasPorCobrar]);

  const limpiarFiltros = useCallback(() => {
    const filtrosVacios = { ...INITIAL_FILTERS };
    setFiltros(filtrosVacios);
    cargarCuentasPorCobrar(filtrosVacios, { resetPage: true });
  }, [cargarCuentasPorCobrar]);

  const cambiarPagina = useCallback((nuevaPagina) => {
    setPagination((prev) => {
      const totalPages = prev.totalPages || 1;
      const page = Math.min(Math.max(1, nuevaPagina), totalPages);
      return { ...prev, page };
    });
  }, []);

  const metricas = {
    cuentasEnMora: cuentasPorCobrar.filter((c) => c.estado === 'En mora').length,
    cuentasAlDia: cuentasPorCobrar.filter((c) => c.estado === 'Al día').length,
    montoTotalMora: cuentasPorCobrar
      .filter((c) => c.estado === 'En mora')
      .reduce((sum, c) => sum + c.totalDeuda, 0),
    clienteConMayorDeuda: cuentasPorCobrar.length > 0
      ? cuentasPorCobrar.reduce((max, c) => (c.totalDeuda > max.totalDeuda ? c : max), cuentasPorCobrar[0])
      : null
  };

  useEffect(() => {
    cargarResumen();
    cargarCuentasPorCobrar(undefined, { resetPage: true });
    cargarEstadisticasMora();
    cargarProyeccionCobranza();
  }, [cargarResumen, cargarCuentasPorCobrar, cargarEstadisticasMora, cargarProyeccionCobranza]);

  return {
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
    setError: (mensaje) => setErrorMessage(mensaje || null),
    limpiarError: () => setErrorMessage(null),
    limpiarDetalleCliente: () => setDetalleCliente(null)
  };
};