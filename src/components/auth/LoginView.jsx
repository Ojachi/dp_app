/**
 * Vista de Login
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import './Auth.css';

const LoginView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Obtener la ruta desde donde fue redirigido (si existe)
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Redirigir según el rol del usuario o a la página original
        const userRole = result.user?.role || result.user?.tipo_usuario;
        let dashboardPath = from;
        
        // Si viene del root, definir dashboard según rol
        if (from === '/dashboard' || from === '/') {
          switch (userRole) {
            case 'gerente':
              dashboardPath = '/dashboard';
              break;
            case 'vendedor':
              dashboardPath = '/dashboard';
              break;
            case 'distribuidor':
              dashboardPath = '/dashboard';
              break;
            default:
              dashboardPath = '/dashboard';
          }
        }
        
        navigate(dashboardPath, { replace: true });
      } else {
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Distribuciones Perdomo</h2>
          <p>Sistema de Gestión de Facturas y Pagos</p>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <LoginForm 
          onSubmit={handleLogin} 
          loading={loading}
        />
        
        <div className="auth-footer">
          <small className="text-muted">
            © 2025 Distribuciones Perdomo - Todos los derechos reservados
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginView;