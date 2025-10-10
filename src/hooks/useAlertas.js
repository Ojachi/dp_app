/**
 * Hook personalizado para gestión de alertas
 */
import { useState, useEffect, useCallback } from 'react';
import { alertasService } from '../services/alertasService';

export const useAlertas = () => {
  const [alertas, setAlertas] = useState([]);
  const [contadores, setContadores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar alertas
  const loadAlertas = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await alertasService.getAlertas(filtros);
      setAlertas(response.results || []);
      return response;
    } catch (err) {
      setError(err.message);
      setAlertas([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar contadores
  const loadContadores = useCallback(async () => {
    try {
      const data = await alertasService.getContadorAlertas();
      setContadores(data);
      return data;
    } catch (err) {
      console.error('Error al cargar contadores:', err);
      setContadores({
        total: 0,
        no_leidas: 0,
        por_prioridad: { alta: 0, media: 0, baja: 0 },
        por_tipo: {},
        recientes: 0
      });
    }
  }, []);

  // Marcar como leída
  const marcarLeida = useCallback(async (id) => {
    try {
      setError(null);
      await alertasService.marcarComoLeida(id);
      
      // Actualizar en la lista local
      setAlertas(prev => prev.map(alerta => 
        alerta.id === id 
          ? { ...alerta, leida: true, fecha_leida: new Date().toISOString() }
          : alerta
      ));
      
      // Actualizar contadores
      setContadores(prev => prev ? {
        ...prev,
        no_leidas: Math.max(0, prev.no_leidas - 1)
      } : null);
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Marcar como no leída
  const marcarNoLeida = useCallback(async (id) => {
    try {
      setError(null);
      await alertasService.marcarNoLeida(id);
      
      // Actualizar en la lista local
      setAlertas(prev => prev.map(alerta => 
        alerta.id === id 
          ? { ...alerta, leida: false, fecha_leida: null }
          : alerta
      ));
      
      // Actualizar contadores
      setContadores(prev => prev ? {
        ...prev,
        no_leidas: prev.no_leidas + 1
      } : null);
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Marcar múltiples como leídas
  const marcarVariasLeidas = useCallback(async (ids) => {
    try {
      setError(null);
      await alertasService.marcarVariasLeidas(ids);
      
      // Actualizar en la lista local
      setAlertas(prev => prev.map(alerta => 
        ids.includes(alerta.id)
          ? { ...alerta, leida: true, fecha_leida: new Date().toISOString() }
          : alerta
      ));
      
      // Actualizar contadores
      const noLeidasEnIds = alertas.filter(a => ids.includes(a.id) && !a.leida).length;
      setContadores(prev => prev ? {
        ...prev,
        no_leidas: Math.max(0, prev.no_leidas - noLeidasEnIds)
      } : null);
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [alertas]);

  // Crear nueva alerta
  const crearAlerta = useCallback(async (alertaData) => {
    try {
      setError(null);
      const nuevaAlerta = await alertasService.createAlerta(alertaData);
      
      // Agregar a la lista local
      setAlertas(prev => [nuevaAlerta, ...prev]);
      
      // Actualizar contadores
      setContadores(prev => prev ? {
        ...prev,
        total: prev.total + 1,
        no_leidas: prev.no_leidas + 1
      } : null);
      
      return nuevaAlerta;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Eliminar alerta
  const eliminarAlerta = useCallback(async (id) => {
    try {
      setError(null);
      await alertasService.deleteAlerta(id);
      
      const alertaEliminada = alertas.find(a => a.id === id);
      
      // Remover de la lista local
      setAlertas(prev => prev.filter(alerta => alerta.id !== id));
      
      // Actualizar contadores
      if (alertaEliminada) {
        setContadores(prev => prev ? {
          ...prev,
          total: Math.max(0, prev.total - 1),
          no_leidas: alertaEliminada.leida ? prev.no_leidas : Math.max(0, prev.no_leidas - 1)
        } : null);
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [alertas]);

  // Obtener estadísticas
  const loadEstadisticas = useCallback(async (filtros = {}) => {
    try {
      setError(null);
      const estadisticas = await alertasService.getEstadisticas(filtros);
      return estadisticas;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Exportar reporte
  const exportarReporte = useCallback(async (filtros = {}, formato = 'excel') => {
    try {
      setError(null);
      const result = await alertasService.exportarReporte(filtros, formato);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Función de refrescar (alias para compatibilidad)
  const refresh = useCallback(() => {
    loadContadores();
    loadAlertas();
  }, [loadContadores, loadAlertas]);

  // Alias para compatibilidad con código existente
  const marcarComoLeida = marcarLeida;
  const contadorNuevas = contadores?.no_leidas || 0;

  // Efecto para cargar contadores al inicializar
  useEffect(() => {
    loadContadores();
  }, [loadContadores]);

  return {
    // Estado
    alertas,
    contadores,
    loading,
    error,
    
    // Acciones
    loadAlertas,
    loadContadores,
    marcarLeida,
    marcarNoLeida,
    marcarVariasLeidas,
    crearAlerta,
    eliminarAlerta,
    loadEstadisticas,
    exportarReporte,
    refresh,
    
    // Aliases para compatibilidad
    marcarComoLeida,
    contadorNuevas,
    
    // Utilidades
    clearError: () => setError(null),
    setAlertas,
    
    // Propiedades derivadas
    alertasCount: contadores?.total || 0,
    noLeidasCount: contadores?.no_leidas || 0,
    recientesCount: contadores?.recientes || 0
  };
};