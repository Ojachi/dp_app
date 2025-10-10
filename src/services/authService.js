/**
 * Servicios de autenticación con manejo de tokens JWT
 */
import apiClient, { tokenManager } from './api';

export const authService = {
  // Login de usuario
  async login(credentials) {
    try {
      console.log('Login request sent:', credentials);
      const response = await apiClient.post('/auth/login/', credentials);
      console.log('Login response:', response.data);
      
      // Guardar el token si viene en la respuesta
      if (response.data.token) {
        tokenManager.setToken(response.data.token);
        console.log('Token guardado:', response.data.token);
      } else if (response.data.access_token) {
        // En caso de que el backend use 'access_token'
        tokenManager.setToken(response.data.access_token);
        console.log('Access token guardado:', response.data.access_token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en login:', error.response?.data);
      throw new Error(error.response?.data?.message || error.response?.data?.detail || 'Error al iniciar sesión');
    }
  },

  // Logout de usuario
  async logout() {
    try {
      // Intentar logout en el servidor si hay endpoint
      if (tokenManager.getToken()) {
        await apiClient.post('/auth/logout/');
      }
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
      // Continuamos con la limpieza local aunque falle el servidor
    } finally {
      // Limpiar token y datos locales
      tokenManager.removeToken();
      localStorage.removeItem('user');
      console.log('Datos de sesión limpiados');
    }
    return true;
  },

  // Obtener información del usuario actual
  async getCurrentUser() {
    try {
      if (!tokenManager.getToken()) {
        throw new Error('No hay token disponible');
      }

      const response = await apiClient.get('/auth/user/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      throw new Error('Error al obtener información del usuario');
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = tokenManager.getToken();
    const user = localStorage.getItem('user');
    
    // Verificar que tenemos token y que sea válido
    return !!token && tokenManager.isTokenValid() && !!user;
  },

  // Obtener usuario del localStorage
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Guardar usuario en localStorage
  saveUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Obtener token actual
  getToken() {
    return tokenManager.getToken();
  },

  // Verificar si el token es válido
  isTokenValid() {
    return tokenManager.isTokenValid();
  }
};