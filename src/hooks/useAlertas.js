/**
 * Hook personalizado para manejo de alertas - Versión simplificada
 */
import { useState } from 'react';

export const useAlertas = () => {
  const [alertas] = useState([]);
  const [contadorNuevas] = useState(0);
  const [loading] = useState(false);
  const [error] = useState(null);

  // Versiones simplificadas de las funciones que no hacen nada por ahora
  const loadAlertas = () => Promise.resolve();
  const marcarComoLeida = () => Promise.resolve(true);
  const refresh = () => {};

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