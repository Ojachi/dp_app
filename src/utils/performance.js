/**
 * Configuración de optimización de rendimiento
 * Incluye lazy loading, code splitting y memoización
 */

import React, { lazy, Suspense } from 'react';
import { PageLoader } from './components';

// === LAZY LOADING DE MÓDULOS ===

// Lazy loading para reducir el bundle inicial
export const DashboardView = lazy(() => import('./modules/Dashboard/DashboardView'));
export const UsuariosView = lazy(() => import('./modules/Usuarios/UsuariosView'));
export const FacturasView = lazy(() => import('./modules/Facturas/FacturasView'));
export const PagosView = lazy(() => import('./modules/Pagos/PagosView'));
export const CarteraView = lazy(() => import('./modules/Cartera/CarteraView'));
export const ImportacionView = lazy(() => import('./modules/Importacion/ImportacionView'));

// === WRAPPER PARA SUSPENSE ===

export const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <PageLoader text="Cargando módulo..." />}>
    {children}
  </Suspense>
);

// === CONFIGURACIÓN DE PERFORMANCE ===

export const performanceConfig = {
  // Configuración de React Dev Tools Profiler
  enableProfiling: process.env.NODE_ENV === 'development',
  
  // Límites para virtualización de listas
  virtualScrollThreshold: 100,
  
  // Configuración de debounce para búsquedas
  searchDebounceMs: 300,
  
  // Configuración de paginación por defecto
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Configuración de cache
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  
  // Configuración de lazy loading de imágenes
  lazyImageThreshold: '50px',
  
  // Límites para notificaciones toast
  maxToasts: 5,
  toastTimeout: 5000
};

// === UTILIDADES DE OPTIMIZACIÓN ===

/**
 * Hook para debounce de valores (optimiza búsquedas)
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para throttle de funciones (optimiza scroll/resize)
 */
export const useThrottle = (callback, delay) => {
  const throttledCallbackRef = React.useRef();
  const lastExecutedRef = React.useRef(0);

  React.useEffect(() => {
    throttledCallbackRef.current = callback;
  }, [callback]);

  return React.useCallback((...args) => {
    const now = Date.now();
    if (now - lastExecutedRef.current >= delay) {
      lastExecutedRef.current = now;
      throttledCallbackRef.current(...args);
    }
  }, [delay]);
};

/**
 * Hook para intersection observer (lazy loading)
 */
export const useIntersectionObserver = (options = {}) => {
  const [ref, setRef] = React.useState(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isIntersecting];
};

/**
 * Componente para lazy loading de imágenes
 */
export const LazyImage = ({ src, alt, placeholder, className, ...props }) => {
  const [imgRef, isIntersecting] = useIntersectionObserver();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  return (
    <div ref={imgRef} className={className}>
      {isIntersecting && !hasError ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          {...props}
        />
      ) : (
        <div className="bg-light d-flex align-items-center justify-content-center">
          {hasError ? (
            <i className="fas fa-image text-muted"></i>
          ) : (
            placeholder || <div className="spinner-border spinner-border-sm"></div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * HOC para memoización de componentes pesados
 */
export const withPerformanceOptimization = (Component, compareProps) => {
  return React.memo(Component, compareProps);
};

/**
 * Utilidad para chunking de arrays grandes
 */
export const chunkArray = (array, chunkSize = performanceConfig.defaultPageSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Utilidad para formateo de números grandes
 */
export const formatLargeNumber = (num) => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Utilidad para cache simple en memoria
 */
export const createSimpleCache = (ttl = performanceConfig.cacheTimeout) => {
  const cache = new Map();
  
  const set = (key, value) => {
    cache.set(key, {
      value,
      expires: Date.now() + ttl
    });
  };
  
  const get = (key) => {
    const item = cache.get(key);
    if (!item || Date.now() > item.expires) {
      cache.delete(key);
      return null;
    }
    return item.value;
  };
  
  const clear = () => cache.clear();
  const size = () => cache.size;
  
  return { set, get, clear, size };
};

// === CONFIGURACIÓN DE WEBPACK (para CRA ejectado) ===

export const webpackOptimizations = {
  // Code splitting por vendor
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5
      }
    }
  },
  
  // Minimización avanzada
  minimizer: {
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  }
};

// === MÉTRICAS DE PERFORMANCE ===

export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    if (performanceConfig.enableProfiling) {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    return result;
  };
};

/**
 * Hook para medir renders y re-renders
 */
export const useRenderCount = (componentName) => {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current++;
    if (performanceConfig.enableProfiling) {
      console.log(`${componentName} render count:`, renderCount.current);
    }
  });
  
  return renderCount.current;
};

