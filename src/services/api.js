/**
 * Configuración base de la API con manejo de Token (DRF Token Authentication)
 */
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Funciones para manejo de token (opaco, no es JWT)
const TOKEN_KEY = 'authToken';

export const tokenManager = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  // Para DRF Token, consideramos válido si existe; la expiración se valida en el servidor
  isTokenValid: () => Boolean(localStorage.getItem(TOKEN_KEY)),
};

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para agregar token a todas las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no autorizado
      tokenManager.removeToken();
      localStorage.removeItem('user');
      
      // Solo redirigir si no estamos ya en login
      if (!window.location.pathname.includes('/login')) {
        console.warn('Token expirado - redirigiendo al login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };