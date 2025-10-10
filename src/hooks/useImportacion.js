import { useState, useCallback } from 'react';
import importacionService from '../services/importacionService';

export const useImportacion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados para el proceso de importación
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [validacionResultado, setValidacionResultado] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [importacionEnProgreso, setImportacionEnProgreso] = useState(null);
  const [resultadoImportacion, setResultadoImportacion] = useState(null);
  
  // Estados para historial y estadísticas
  const [historialImportaciones, setHistorialImportaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [detalleErrores, setDetalleErrores] = useState([]);

  // Filtros para historial
  const [filtros, setFiltros] = useState({
    estado: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  // Paso 1: Seleccionar y validar archivo
  const seleccionarArchivo = useCallback(async (file) => {
    try {
      setLoading(true);
      setError(null);
      setArchivoSeleccionado(file);
      
      // Validar archivo
      const resultado = await importacionService.validarArchivo(file);
      setValidacionResultado(resultado);
      
      return resultado;
    } catch (err) {
      setError('Error al validar archivo: ' + err.message);
      setArchivoSeleccionado(null);
      setValidacionResultado(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Paso 2: Obtener vista previa de datos
  const obtenerVistaPrevia = useCallback(async (opciones = {}) => {
    if (!archivoSeleccionado) {
      throw new Error('No hay archivo seleccionado');
    }

    try {
      setLoading(true);
      setError(null);
      
      const vista = await importacionService.obtenerVistaPrevia(archivoSeleccionado, opciones);
      setVistaPrevia(vista);
      
      return vista;
    } catch (err) {
      setError('Error al obtener vista previa: ' + err.message);
      console.error('Error obtenerVistaPrevia:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [archivoSeleccionado]);

  // Paso 3: Ejecutar importación
  const ejecutarImportacion = useCallback(async (opciones = {}) => {
    if (!archivoSeleccionado) {
      throw new Error('No hay archivo seleccionado');
    }

    try {
      setLoading(true);
      setError(null);
      setResultadoImportacion(null);
      
      // Iniciar importación
      const resultado = await importacionService.importarFacturas(archivoSeleccionado, opciones);
      
      setResultadoImportacion(resultado);
      setImportacionEnProgreso(resultado);
      
      // Si la importación fue exitosa, limpiar estados de archivo
      if (resultado.estado === 'Completada') {
        setArchivoSeleccionado(null);
        setValidacionResultado(null);
        setVistaPrevia(null);
      }
      
      return resultado;
    } catch (err) {
      setError('Error en importación: ' + err.message);
      console.error('Error ejecutarImportacion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [archivoSeleccionado]);

  // Monitorear progreso de importación
  const verificarProgresoImportacion = useCallback(async (importacionId) => {
    try {
      const estado = await importacionService.obtenerEstadoImportacion(importacionId);
      setImportacionEnProgreso(estado);
      
      // Si completó, actualizar resultado final
      if (estado.estado === 'Completada' || estado.estado === 'Fallida') {
        setResultadoImportacion(estado);
        setImportacionEnProgreso(null);
      }
      
      return estado;
    } catch (err) {
      console.error('Error verificarProgresoImportacion:', err);
      return null;
    }
  }, []);

  // Cargar historial de importaciones
  const cargarHistorial = useCallback(async (nuevosFiltros = filtros) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await importacionService.obtenerHistorialImportaciones(nuevosFiltros);
      setHistorialImportaciones(data.importaciones || []);
      
      return data;
    } catch (err) {
      setError('Error al cargar historial: ' + err.message);
      console.error('Error cargarHistorial:', err);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await importacionService.obtenerEstadisticasImportacion();
      setEstadisticas(data);
      
      return data;
    } catch (err) {
      setError('Error al cargar estadísticas: ' + err.message);
      console.error('Error cargarEstadisticas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener detalle de errores
  const cargarDetalleErrores = useCallback(async (importacionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const errores = await importacionService.obtenerDetalleErrores(importacionId);
      setDetalleErrores(errores);
      
      return errores;
    } catch (err) {
      setError('Error al cargar errores: ' + err.message);
      console.error('Error cargarDetalleErrores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Descargar template
  const descargarTemplate = useCallback(async (formato = 'xlsx') => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await importacionService.descargarTemplate(formato);
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `template_facturas.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, mensaje: 'Template descargado exitosamente' };
    } catch (err) {
      setError('Error al descargar template: ' + err.message);
      console.error('Error descargarTemplate:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reintentar importación
  const reintentarImportacion = useCallback(async (importacionId, archivoCorregido) => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await importacionService.reintentarImportacion(importacionId, archivoCorregido);
      
      // Recargar historial para ver el nuevo intento
      await cargarHistorial();
      
      return resultado;
    } catch (err) {
      setError('Error al reintentar importación: ' + err.message);
      console.error('Error reintentarImportacion:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cargarHistorial]);

  // Gestión de filtros
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    const filtrosActualizados = { ...filtros, ...nuevosFiltros };
    setFiltros(filtrosActualizados);
    cargarHistorial(filtrosActualizados);
  }, [filtros, cargarHistorial]);

  const limpiarFiltros = useCallback(() => {
    const filtrosVacios = {
      estado: '',
      usuario: '',
      fechaDesde: '',
      fechaHasta: ''
    };
    setFiltros(filtrosVacios);
    cargarHistorial(filtrosVacios);
  }, [cargarHistorial]);

  // Limpiar estado de importación actual
  const limpiarImportacionActual = useCallback(() => {
    setArchivoSeleccionado(null);
    setValidacionResultado(null);
    setVistaPrevia(null);
    setImportacionEnProgreso(null);
    setResultadoImportacion(null);
    setDetalleErrores([]);
  }, []);

  // Métricas calculadas
  const metricas = {
    // Métricas del historial
    totalImportaciones: historialImportaciones.length,
    importacionesExitosas: historialImportaciones.filter(i => i.estado === 'Completada').length,
    importacionesConErrores: historialImportaciones.filter(i => i.estado === 'Completada con errores').length,
    importacionesFallidas: historialImportaciones.filter(i => i.estado === 'Fallida').length,
    
    // Métricas del archivo actual
    archivoValido: validacionResultado?.valido || false,
    porcentajeExito: validacionResultado ? 
      ((validacionResultado.filasValidas / validacionResultado.totalFilas) * 100).toFixed(1) : 0,
    
    // Estado del proceso
    procesoEnCurso: !!importacionEnProgreso,
    importacionCompleta: !!resultadoImportacion,
    
    // Progreso actual
    progreso: importacionEnProgreso?.progreso || 0,
    eta: importacionEnProgreso?.etaMs || 0
  };

  // Validaciones
  const validaciones = {
    puedeIniciarImportacion: validacionResultado?.valido && vistaPrevia && !loading,
    tieneArchivoSeleccionado: !!archivoSeleccionado,
    tieneVistaPrevia: !!vistaPrevia,
    hayErroresValidacion: validacionResultado?.errores?.length > 0,
    hayAdvertenciasValidacion: validacionResultado?.advertencias?.length > 0
  };

  return {
    // Estados principales
    loading,
    error,
    archivoSeleccionado,
    validacionResultado,
    vistaPrevia,
    importacionEnProgreso,
    resultadoImportacion,
    historialImportaciones,
    estadisticas,
    detalleErrores,
    filtros,
    metricas,
    validaciones,

    // Acciones del proceso de importación
    seleccionarArchivo,
    obtenerVistaPrevia,
    ejecutarImportacion,
    verificarProgresoImportacion,
    reintentarImportacion,
    limpiarImportacionActual,

    // Acciones de gestión
    cargarHistorial,
    cargarEstadisticas,
    cargarDetalleErrores,
    descargarTemplate,
    
    // Gestión de filtros
    actualizarFiltros,
    limpiarFiltros,

    // Utilidades
    setError: (mensaje) => setError(mensaje),
    limpiarError: () => setError(null)
  };
};