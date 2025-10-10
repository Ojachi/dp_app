/**
 * Hook personalizado para manejo de facturas
 */
import { useState, useEffect, useCallback } from 'react';
import { facturasService } from '../services/facturasService';

export const useFacturas = (initialFilters = {}) => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Función para cargar facturas
  const loadFacturas = useCallback(async (newFilters = filters) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await facturasService.getFacturas(newFilters);
      
      if (response.results) {
        setFacturas(response.results);
        setPagination({
          currentPage: Math.ceil((newFilters.offset || 0) / (newFilters.limit || 10)) + 1,
          totalPages: Math.ceil(response.count / (newFilters.limit || 10)),
          totalItems: response.count,
          itemsPerPage: newFilters.limit || 10
        });
      } else {
        setFacturas(response);
      }
    } catch (err) {
      setError(err.message);
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Función para aplicar filtros
  const applyFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadFacturas(updatedFilters);
  }, [filters, loadFacturas]);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    loadFacturas({});
  }, [loadFacturas]);

  // Función para refrescar facturas
  const refreshFacturas = useCallback(() => {
    loadFacturas(filters);
  }, [loadFacturas, filters]);

  // Cargar facturas al inicializar
  useEffect(() => {
    loadFacturas();
  }, [loadFacturas]);

  return {
    facturas,
    loading,
    error,
    filters,
    pagination,
    applyFilters,
    clearFilters,
    refreshFacturas,
    loadFacturas
  };
};