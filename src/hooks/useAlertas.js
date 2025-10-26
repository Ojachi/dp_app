/**
 * Hook personalizado para gestión de alertas
 */
import { useState, useEffect, useCallback } from 'react';
import { alertasService } from '../services/alertasService';

export const useAlertas = (options = {}) => {
  const { autoLoad = true } = options;
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
      const rawList = Array.isArray(response) ? response : (response?.results || []);
      // Normalizar campos según backend
      const normalized = rawList.map((it) => ({
        ...it,
        // bandera de lectura basada en estado
        leida: typeof it.leida === 'boolean' ? it.leida : it.estado === 'leida',
        // compatibilidad de fechas
        created_at: it.created_at || it.fecha_generacion || it.fecha_creacion || null,
        // tipo plano desde backend
        tipo: it.tipo || it.tipo_alerta?.tipo || it.tipo_alerta_tipo || it.tipo_alerta_nombre,
        // subtipo (por_vencer | vencida) cuando aplique
        subtipo: it.subtipo || it.alerta_subtipo || null,
      }));
      setAlertas(normalized);
      return { count: response?.count ?? normalized.length, results: normalized };
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
      // Backend retorna { alertas_nuevas, alertas_por_vencer, alertas_vencidas } (y clave legacy alertas_criticas)
      const normalized = {
        total: null,
        no_leidas: data.alertas_nuevas ?? 0,
        criticas: (data.alertas_criticas ?? data.alertas_vencidas) ?? 0, // compatibilidad con UI existente
        // Nuevas claves específicas por subtipo
        por_vencer: data.alertas_por_vencer ?? 0,
        vencidas: (data.alertas_vencidas ?? data.alertas_criticas) ?? 0,
        // No provisto por backend actualmente
        recientes: 0,
      };
      setContadores(normalized);
      return normalized;
    } catch (err) {
      console.error('Error al cargar contadores:', err);
      setContadores({ total: 0, no_leidas: 0, criticas: 0, por_vencer: 0, vencidas: 0, recientes: 0 });
    }
  }, []);

  // Cargar estadísticas agregadas (si el backend las expone)
  const loadEstadisticas = useCallback(async (filtros = {}) => {
    try {
      const data = await alertasService.getEstadisticas(filtros);
      return data;
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      return null;
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

  // Función de refrescar (alias para compatibilidad)
  const refresh = useCallback(() => {
    loadContadores();
    loadAlertas();
  }, [loadContadores, loadAlertas]);

  // Alias para compatibilidad con código existente
  const marcarComoLeida = marcarLeida;
  const contadorNuevas = contadores?.no_leidas || 0;
  const contadorCriticas = contadores?.criticas || 0;
  // Derivados opcionales para nuevos subtipos
  const contadorPorVencer = contadores?.por_vencer || 0;
  const contadorVencidas = contadores?.vencidas || contadores?.criticas || 0;

  // Efecto para cargar contadores al inicializar
  useEffect(() => {
    if (autoLoad) {
      loadContadores();
    }
  }, [autoLoad, loadContadores]);

  return {
    // Estado
    alertas,
    contadores,
    loading,
    error,
    
    // Acciones
    loadAlertas,
    loadContadores,
    loadEstadisticas,
    marcarLeida,
    marcarNoLeida,
    marcarVariasLeidas,
    crearAlerta,
    eliminarAlerta,
    refresh,
    
    // Aliases para compatibilidad
    marcarComoLeida,
    contadorNuevas,
    contadorCriticas,
  contadorPorVencer,
  contadorVencidas,
    
    // Utilidades
    clearError: () => setError(null),
    setAlertas,
    
    // Propiedades derivadas
    alertasCount: contadores?.total || 0,
    noLeidasCount: contadores?.no_leidas || 0,
    recientesCount: contadores?.recientes || 0
  };
};