/**
 * Configuración de rutas de la aplicación
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginView from '../components/auth/LoginView';
import FacturasView from '../modules/Facturas/FacturasView';
import PagosView from '../modules/Pagos/PagosView';
import CarteraView from '../modules/Cartera/CarteraView';
import UsuariosView from '../modules/Usuarios/UsuariosView';
import PoblacionesAsignacionView from '../modules/Parametrizacion/components/PoblacionesAsignacionView';
import AlertasView from '../modules/Alertas/AlertasView';
import { USER_ROLES } from '../utils/constants';
import { FEATURE_FLAGS, DEFAULT_PRIVATE_ROUTE } from '../config/featureFlags';
import ParametrizacionView from '../modules/Parametrizacion/ParametrizacionView';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  const defaultDestination = DEFAULT_PRIVATE_ROUTE;

  const protectedRoutes = [
    {
      path: '/facturas',
      element: <FacturasView />,
      roles: null,
    },
    {
      path: '/facturas/:id',
      element: <FacturasView />,
      roles: null,
    },
    {
      path: '/pagos',
      element: <PagosView />,
      roles: null,
    },
    FEATURE_FLAGS.alertas && {
      path: '/alertas',
      element: <AlertasView />,
      roles: [USER_ROLES.GERENTE, USER_ROLES.VENDEDOR],
    },
    FEATURE_FLAGS.cartera && {
      path: '/cartera',
      element: <CarteraView />,
      roles: [USER_ROLES.GERENTE],
    },
    FEATURE_FLAGS.usuarios && {
      path: '/usuarios',
      element: <UsuariosView />,
      roles: [USER_ROLES.GERENTE],
    },
    {
      path: '/poblaciones',
      element: <PoblacionesAsignacionView />,
      roles: [USER_ROLES.GERENTE],
    },
    FEATURE_FLAGS.parametrizacion && {
      path: '/parametrizacion',
      element: <ParametrizacionView />,
      roles: [USER_ROLES.GERENTE],
    },
  ].filter(Boolean);

  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to={defaultDestination} replace /> : <LoginView />
        } 
      />

      {/* Rutas protegidas */}
      {/* Redirección del root */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to={defaultDestination} replace />
          </ProtectedRoute>
        } 
      />
      
      {protectedRoutes.map(({ path, element, roles }) => (
        <Route
          key={path}
          path={path}
          element={(
            <ProtectedRoute roles={roles || []}>
              {element}
            </ProtectedRoute>
          )}
        />
      ))}

      {/* Ruta catch-all para páginas no encontradas */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <Navigate to={defaultDestination} replace />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
