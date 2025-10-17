/**
 * Componente para rutas protegidas por autenticación y roles
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_PRIVATE_ROUTE } from '../config/featureFlags';

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  redirectTo = '/login',
  requireAuth = true 
}) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Si requiere autenticación y no está autenticado, redirigir al login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Si se especifican roles y el usuario no tiene el rol requerido
  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to={DEFAULT_PRIVATE_ROUTE} replace />;
  }

  // Si todo está bien, renderizar el componente
  return children;
};

export default ProtectedRoute;