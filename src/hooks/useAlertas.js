/**
 * Hook personalizado para manejo de alertas
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { alertasService } from '../services/alertasService';

export const useAlertas = (options = {}) => {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [alertas, setAlertas] = useState([]);
  const [contadorNuevas, setContadorNuevas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const intervalRef = useRef(null);

  // Función para cargar alertas
  const loadAlertas = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await alertasService.getAlertas(filters);
      setAlertas(response.results || response);
    } catch (err) {
      setError(err.message);
      setAlertas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para cargar contador de alertas nuevas
  const loadContador = useCallback(async () => {
    try {
      const response = await alertasService.getContadorAlertas();
      setContadorNuevas(response.nuevas || 0);
    } catch (err) {
      console.error('Error al cargar contador de alertas:', err);
    }
  }, []);

  // Función para marcar alerta como leída
  const marcarComoLeida = useCallback(async (alertaId) => {
    try {
      await alertasService.marcarComoLeida(alertaId);
      
      // Actualizar el estado local
      setAlertas(prev => prev.map(alerta => 
        alerta.id === alertaId 
          ? { ...alerta, estado: 'leida' }
          : alerta
      ));
      
      // Actualizar contador
      loadContador();
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [loadContador]);

  // Función para refrescar datos
  const refresh = useCallback(() => {
    loadAlertas();
    loadContador();
  }, [loadAlertas, loadContador]);

  // Configurar auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        loadContador();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadContador]);

  // Cargar datos iniciales
  useEffect(() => {
    loadAlertas();
    loadContador();
  }, [loadAlertas, loadContador]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    alertas,
    contadorNuevas,
    loading,
    error,
    loadAlertas,
    marcarComoLeida,
    refresh
  };
};