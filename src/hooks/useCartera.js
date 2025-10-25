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

  // Estado principal utilizado por la vista actual
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState([]);

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

  useEffect(() => {
    cargarCuentasPorCobrar(undefined, { resetPage: true });
  }, [cargarCuentasPorCobrar]);

  return {
    loading,
    error,
    cuentasPorCobrar,
    filtros,
    pagination,
    cargarCuentasPorCobrar,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,
    setError: (mensaje) => setErrorMessage(mensaje || null),
    limpiarError: () => setErrorMessage(null),
  };
};