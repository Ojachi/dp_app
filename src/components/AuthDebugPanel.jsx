/**
 * Panel de desarrollo para monitorear autenticación y tokens
 * Solo visible en desarrollo
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { tokenDebug } from '../utils/tokenDebug';

const AuthDebugPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user, isAuthenticated, debugAuth } = useAuth();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const token = authService.getToken();
  const isTokenValid = authService.isTokenValid();

  return (
    <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 9999 }}>
      {/* Botón flotante */}
      <button
        className="btn btn-dark btn-sm rounded-circle"
        onClick={() => setIsVisible(!isVisible)}
        style={{ width: '40px', height: '40px' }}
        title="Debug Panel"
      >
        🔍
      </button>

      {/* Panel de debug */}
      {isVisible && (
        <div
          className="card mt-2 shadow"
          style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}
        >
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <small className="fw-bold">🔧 Auth Debug Panel</small>
            <button
              className="btn-close btn-close-white btn-sm"
              onClick={() => setIsVisible(false)}
            ></button>
          </div>
          <div className="card-body p-2">
            <div className="row g-1 text-xs">
              {/* Estado de autenticación */}
              <div className="col-12">
                <div className="alert alert-sm p-2 mb-2">
                  <strong>Estado:</strong>{' '}
                  <span className={`badge ${isAuthenticated ? 'bg-success' : 'bg-danger'}`}>
                    {isAuthenticated ? 'Autenticado' : 'No autenticado'}
                  </span>
                </div>
              </div>

              {/* Token info */}
              <div className="col-12">
                <div className="card card-body p-2 mb-2 bg-light">
                  <small className="fw-bold">🔑 Token:</small>
                  <div className="text-xs">
                    <div>Estado: {token ? '✅ Presente' : '❌ Ausente'}</div>
                    <div>Válido: {isTokenValid ? '✅ Sí' : '❌ No'}</div>
                    {token && (
                      <div className="mt-1">
                        <small className="text-muted">
                          {token.substring(0, 20)}...
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Usuario info */}
              <div className="col-12">
                <div className="card card-body p-2 mb-2 bg-light">
                  <small className="fw-bold">👤 Usuario:</small>
                  <div className="text-xs">
                    {user ? (
                      <>
                        <div>Nombre: {user.first_name || user.username}</div>
                        <div>Email: {user.email}</div>
                        <div>Rol: {user.role || user.tipo_usuario}</div>
                      </>
                    ) : (
                      <div className="text-muted">No hay usuario</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="col-12">
                <div className="d-grid gap-1">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      debugAuth();
                      if (token) tokenDebug.logTokenInfo(token);
                    }}
                  >
                    📋 Log completo
                  </button>
                  
                  <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={() => {
                      authService.logout();
                      window.location.reload();
                    }}
                  >
                    🚪 Force Logout
                  </button>

                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => {
                      console.clear();
                      console.log('🧹 Consola limpiada');
                    }}
                  >
                    🧹 Clear Console
                  </button>
                </div>
              </div>

              {/* Status del localStorage */}
              <div className="col-12">
                <div className="mt-2 text-xs text-muted">
                  <small>
                    📦 localStorage: {Object.keys(localStorage).length} items
                    <br />
                    🔑 authToken: {localStorage.getItem('authToken') ? '✅' : '❌'}
                    <br />
                    👤 user: {localStorage.getItem('user') ? '✅' : '❌'}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .text-xs {
          font-size: 0.75rem;
        }
        .alert-sm {
          padding: 0.375rem 0.75rem;
          margin-bottom: 0.5rem;
          border: 1px solid transparent;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default AuthDebugPanel;