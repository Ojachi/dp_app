/**
 * Servicio para gestión de usuarios
 * Proporciona funcionalidades CRUD para administrar usuarios del sistema (solo API real)
 */
import apiClient from './api';

class UsuariosService {
  
  // Obtener lista de usuarios con filtros
  async getUsuarios(filtros = {}) {
    // Build query using axios params to avoid manual string concat
    const params = {};
    Object.keys(filtros).forEach(key => {
      const v = filtros[key];
      if (v !== '' && v !== null && v !== undefined) {
        params[key] = v;
      }
    });

    const response = await apiClient.get('/users/', { params });
    // Normalize to array whether paginated or not
    return Array.isArray(response.data)
      ? response.data
      : (response.data?.results || []);
  }

  // Obtener usuario por ID
  async getUsuario(id) {
    const response = await apiClient.get(`/users/${id}/`);
    return response.data;
  }

  // Crear nuevo usuario
  async createUsuario(userData) {
    const response = await apiClient.post('/users/', userData);
    return response.data;
  }

  // Actualizar usuario
  async updateUsuario(id, userData) {
    const response = await apiClient.put(`/users/${id}/`, userData);
    return response.data;
  }

  // Eliminar usuario (soft delete)
  async deleteUsuario(id) {
    await apiClient.delete(`/users/${id}/`);
    return { success: true };
  }

  // Activar/Desactivar usuario
  async toggleUsuarioStatus(id, is_active) {
    const response = await apiClient.patch(`/users/${id}/`, { is_active });
    return response.data;
  }

  // Resetear contraseña
  async resetPassword(id, newPassword) {
    const response = await apiClient.post(`/users/${id}/reset-password/`, { password: newPassword });
    return response.data || { success: true };
  }

  // Validar email único
  async validarEmail(email, excludeId = null) {
    const params = new URLSearchParams();
    params.append('email', email);
    if (excludeId) {
      params.append('exclude_id', excludeId);
    }
    const response = await apiClient.get(`/users/validar-email/?${params.toString()}`);
    return response.data;
  }

  // Validar username único
  async validarUsername(username, excludeId = null) {
    const params = new URLSearchParams();
    params.append('username', username);
    if (excludeId) {
      params.append('exclude_id', excludeId);
    }
    const response = await apiClient.get(`/users/validar-username/?${params.toString()}`);
    return response.data;
  }
}

// Crear instancia del servicio
const usuariosService = new UsuariosService();

// Exportar métodos principales
export const {
  getUsuarios,
  getUsuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  toggleUsuarioStatus,
  resetPassword,
  validarEmail,
  validarUsername
} = usuariosService;

export { usuariosService };
export default usuariosService;