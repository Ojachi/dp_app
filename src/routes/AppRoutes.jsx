/**
 * Configuración de rutas de la aplicación
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginView from '../components/auth/LoginView';
import DashboardView from '../modules/Dashboard/DashboardView';
import FacturasView from '../modules/Facturas/FacturasView';
import PagosView from '../modules/Pagos/PagosView';
import CarteraView from '../modules/Cartera/CarteraView';
import UsuariosView from '../modules/Usuarios/UsuariosView';
import ImportacionView from '../modules/Importacion/ImportacionView';
import AlertasView from '../modules/Alertas/AlertasView';
import { USER_ROLES } from '../utils/constants';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginView />
        } 
      />

      {/* Rutas protegidas */}
      {/* Redirección del root */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } 
      />
      
      {/* Dashboard - Accesible para todos los usuarios autenticados */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardView />
          </ProtectedRoute>
        } 
      />
      
      {/* Facturas - Todos pueden ver, solo gerentes pueden crear/editar */}
      <Route 
        path="/facturas" 
        element={
          <ProtectedRoute>
            <FacturasView />
          </ProtectedRoute>
        } 
      />
      
      {/* Pagos - Accesible para todos */}
      <Route 
        path="/pagos" 
        element={
          <ProtectedRoute>
            <PagosView />
          </ProtectedRoute>
        } 
      />
      
      {/* Cartera - Solo gerentes */}
      <Route 
        path="/cartera" 
        element={
          <ProtectedRoute roles={[USER_ROLES.GERENTE]}>
            <CarteraView />
          </ProtectedRoute>
        } 
      />
      
      {/* Usuarios - Solo gerentes */}
      <Route 
        path="/usuarios" 
        element={
          <ProtectedRoute roles={[USER_ROLES.GERENTE]}>
            <UsuariosView />
          </ProtectedRoute>
        } 
      />
      
      {/* Importación - Solo gerentes */}
      <Route 
        path="/importacion" 
        element={
          <ProtectedRoute roles={[USER_ROLES.GERENTE]}>
            <ImportacionView />
          </ProtectedRoute>
        } 
      />
      
      {/* Alertas - Accesible para todos */}
      <Route 
        path="/alertas" 
        element={
          <ProtectedRoute>
            <AlertasView />
          </ProtectedRoute>
        } 
      />

      {/* Ruta catch-all para páginas no encontradas */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
