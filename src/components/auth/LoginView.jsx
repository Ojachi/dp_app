/**
 * Vista de Login
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginForm from './LoginForm';
import './Auth.css';
import { DEFAULT_PRIVATE_ROUTE } from '../../config/featureFlags';

const LoginView = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Obtener la ruta desde donde fue redirigido (si existe)
  const from = location.state?.from?.pathname || DEFAULT_PRIVATE_ROUTE;

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        // Redirigir a la ruta de destino (o la por defecto)
        navigate(from || DEFAULT_PRIVATE_ROUTE, { replace: true });
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