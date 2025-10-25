/**
 * Context para manejo de autenticación y usuario
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Inicializar usuario al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = authService.getUser();
        const hasValidToken = authService.isTokenValid();
        
        if (savedUser && hasValidToken) {
          try {
            // Verificar que el token siga siendo válido con el servidor
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Token inválido en servidor, limpiar datos locales
            authService.logout();
          }
        } else {
          // No hay usuario o token inválido
          if (savedUser || authService.getToken()) {
            authService.logout();
          }
        }
      } catch (error) {
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Función para login
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Realizar login y obtener token
      await authService.login(credentials);
      
      // Obtener información completa del usuario con el token
      const currentUser = await authService.getCurrentUser();
      
      setUser(currentUser);
      setIsAuthenticated(true);
      authService.saveUser(currentUser);
      
      return { success: true, user: currentUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para logout
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Función para verificar permisos por rol
  const hasRole = (roles) => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.some(role => {
        switch (role) {
          case 'gerente':
            return user.is_gerente;
          case 'vendedor':
            return user.is_vendedor;
          case 'distribuidor':
            return user.is_distribuidor;
          default:
            return false;
        }
      });
    }
    
    // Si es un string individual
    switch (roles) {
      case 'gerente':
        return user.is_gerente;
      case 'vendedor':
        return user.is_vendedor;
      case 'distribuidor':
        return user.is_distribuidor;
      default:
        return false;
    }
  };

  // Función para verificar si es gerente
  const isGerente = () => user?.is_gerente || false;
  
  // Función para verificar si es vendedor
  const isVendedor = () => user?.is_vendedor || false;
  
  // Función para verificar si es distribuidor
  const isDistribuidor = () => user?.is_distribuidor || false;

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole,
    isGerente,
    isVendedor,
    isDistribuidor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};