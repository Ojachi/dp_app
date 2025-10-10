/**
 * Índice central de componentes UI
 * Sistema de gestión de distribución - Componentes reutilizables
 * 
 * Exportaciones organizadas por categoría para fácil importación
 * Ejemplo de uso: import { Button, Table, Modal } from './components'
 */

import React from 'react';

// === COMPONENTES BÁSICOS ===
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Select } from './Select';
export { default as Checkbox } from './Checkbox';
export { default as Radio } from './Radio';
export { default as DatePicker } from './DatePicker';
export { default as SearchBar } from './SearchBar';

// === COMPONENTES DE FORMULARIO ===
export { default as FormField, useFormField } from './FormField';

// === COMPONENTES DE NAVEGACIÓN ===
export { default as Pagination } from './Pagination';
export { default as NavItem } from './NavItem';
export { default as FiltersSidebar } from './FiltersSidebar';

// === COMPONENTES DE DATOS ===
export { default as Table } from './Table';
export { 
  default as DataCard,
  MetricCard,
  StatusCard,
  ProgressCard 
} from './DataCard';

// === COMPONENTES DE FEEDBACK ===
export { 
  default as LoadingSpinner,
  PageLoader,
  ButtonLoader,
  InlineLoader,
  CardLoader,
  OverlayLoader 
} from './LoadingSpinner';

export {
  default as Toast,
  ToastProvider,
  useToast
} from './Toast';

export { 
  default as EmptyState,
  NoDataFound,
  NoPermissions,
  NetworkError,
  MaintenanceMode,
  ComingSoon,
  ErrorBoundaryFallback,
  FileTooLarge 
} from './EmptyState';

// === COMPONENTES MODALES ===
export { 
  default as Modal,
  useModal 
} from './Modal';

export {
  default as ConfirmDialog,
  DeleteConfirmDialog,
  LogoutConfirmDialog,
  SaveConfirmDialog,
  DiscardChangesDialog
} from './ConfirmDialog';

// === UTILIDADES ===

/**
 * Hook personalizado para manejar el estado de carga
 */
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  
  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const toggleLoading = () => setLoading(prev => !prev);
  
  const withLoading = async (asyncFunction) => {
    startLoading();
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  };
  
  return {
    loading,
    startLoading,
    stopLoading,
    toggleLoading,
    withLoading
  };
};

/**
 * Hook para manejar estado de error
 */
export const useError = () => {
  const [error, setError] = React.useState(null);
  
  const clearError = () => setError(null);
  const handleError = (err) => {
    console.error('Error capturado:', err);
    setError(err.message || 'Ha ocurrido un error inesperado');
  };
  
  return {
    error,
    setError,
    clearError,
    handleError,
    hasError: Boolean(error)
  };
};

/**
 * Hook para manejar paginación
 */
export const usePagination = (totalItems, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);
  
  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  };
};

