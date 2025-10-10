/**
 * Context para manejo de autenticación y usuario
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { debugAuth } from '../utils/tokenDebug';

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
        
        console.log('Inicializando autenticación...');
        console.log('Usuario guardado:', savedUser);
        console.log('Token válido:', hasValidToken);
        
        if (savedUser && hasValidToken) {
          try {
            // Verificar que el token siga siendo válido con el servidor
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
            console.log('Autenticación inicializada correctamente');
          } catch (error) {
            console.error('Error al verificar usuario con servidor:', error);
            // Token inválido en servidor, limpiar datos locales
            authService.logout();
          }
        } else {
          // No hay usuario o token inválido
          if (savedUser || authService.getToken()) {
            console.log('Limpiando datos de sesión expirados');
            authService.logout();
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
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
      console.log('Iniciando proceso de login...');
      
      // Realizar login y obtener token
      await authService.login(credentials);
      console.log('Login exitoso, obteniendo información del usuario...');
      
      // Obtener información completa del usuario con el token
      const currentUser = await authService.getCurrentUser();
      
      setUser(currentUser);
      setIsAuthenticated(true);
      authService.saveUser(currentUser);
      
      console.log('Usuario autenticado correctamente:', currentUser);
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para logout
  const logout = async () => {
    try {
      console.log('Cerrando sesión...');
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      console.log('Sesión cerrada correctamente');
    }
  };

  // Función para verificar permisos por rol
  const hasRole = (roles) => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.role || user.tipo_usuario);
    }
    return user.role === roles || user.tipo_usuario === roles;
  };

  // Función para verificar si es gerente
  const isGerente = () => hasRole('gerente');
  
  // Función para verificar si es vendedor
  const isVendedor = () => hasRole('vendedor');
  
  // Función para verificar si es distribuidor
  const isDistribuidor = () => hasRole('distribuidor');

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole,
    isGerente,
    isVendedor,
    isDistribuidor,
    // Función de debug para desarrollo
    debugAuth: () => debugAuth()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};