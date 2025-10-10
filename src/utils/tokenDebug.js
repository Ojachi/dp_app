/**
 * Utilidades para debug de tokens JWT
 */

export const tokenDebug = {
  // Decodificar token JWT sin verificar firma
  decodeToken: (token) => {
    try {
      if (!token) return null;
      
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  },

  // Mostrar información del token
  logTokenInfo: (token) => {
    const payload = tokenDebug.decodeToken(token);
    if (!payload) {
      console.log('❌ Token inválido o no proporcionado');
      return;
    }

    const now = Date.now() / 1000;
    const isExpired = payload.exp < now;
    
    console.group('🔑 Información del Token JWT');
    console.log('📋 Payload completo:', payload);
    console.log('👤 Usuario:', payload.username || payload.user_id || payload.sub);
    console.log('🏷️ Rol:', payload.role || payload.tipo_usuario || 'No definido');
    console.log('⏰ Emisión:', new Date(payload.iat * 1000).toLocaleString());
    console.log('⏳ Expiración:', new Date(payload.exp * 1000).toLocaleString());
    console.log('🔴 Expirado:', isExpired ? 'SÍ' : 'NO');
    console.log('⏱️ Tiempo restante:', isExpired ? '0 min' : Math.round((payload.exp - now) / 60) + ' min');
    console.groupEnd();
  },

  // Verificar si el token está por expirar (próximos 5 minutos)
  isTokenExpiringSoon: (token) => {
    const payload = tokenDebug.decodeToken(token);
    if (!payload) return true;
    
    const now = Date.now() / 1000;
    const fiveMinutesFromNow = now + (5 * 60); // 5 minutos
    
    return payload.exp < fiveMinutesFromNow;
  }
};

// Función para mostrar debug de autenticación
export const debugAuth = () => {
  console.group('🔍 Debug de Autenticación');
  
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  console.log('📦 Token en localStorage:', token ? 'Presente' : 'Ausente');
  console.log('👤 Usuario en localStorage:', user ? 'Presente' : 'Ausente');
  
  if (token) {
    tokenDebug.logTokenInfo(token);
  }
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('👤 Datos del usuario:', userData);
    } catch (error) {
      console.error('❌ Error parseando datos del usuario:', error);
    }
  }
  
  console.groupEnd();
};