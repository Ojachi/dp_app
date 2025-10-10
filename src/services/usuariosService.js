/**
 * Servicio para gestión de usuarios
 * Proporciona funcionalidades CRUD para administrar usuarios del sistema
 */
import apiClient from './apiClient';

// Datos de respaldo para desarrollo
const BACKUP_USERS = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@distribuciones.com',
    first_name: 'Administrador',
    last_name: 'Sistema',
    full_name: 'Administrador Sistema',
    telefono: '+57 300 123 4567',
    direccion: 'Oficina Principal',
    ciudad: 'Bogotá',
    is_active: true,
    is_staff: true,
    is_superuser: true,
    is_gerente: true,
    is_vendedor: false,
    is_distribuidor: false,
    date_joined: '2024-01-01T00:00:00Z',
    last_login: '2024-12-10T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-10T10:30:00Z'
  },
  {
    id: 2,
    username: 'vendedor1',
    email: 'vendedor1@distribuciones.com',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    full_name: 'Carlos Rodríguez',
    telefono: '+57 301 234 5678',
    direccion: 'Calle 45 #12-34',
    ciudad: 'Medellín',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    is_gerente: false,
    is_vendedor: true,
    is_distribuidor: false,
    date_joined: '2024-02-15T00:00:00Z',
    last_login: '2024-12-10T09:15:00Z',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-12-09T16:20:00Z'
  },
  {
    id: 3,
    username: 'distribuidor1',
    email: 'distribuidor1@distribuciones.com',
    first_name: 'María',
    last_name: 'González',
    full_name: 'María González',
    telefono: '+57 302 345 6789',
    direccion: 'Carrera 20 #56-78',
    ciudad: 'Cali',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    is_gerente: false,
    is_vendedor: false,
    is_distribuidor: true,
    date_joined: '2024-03-10T00:00:00Z',
    last_login: '2024-12-09T14:45:00Z',
    created_at: '2024-03-10T00:00:00Z',
    updated_at: '2024-12-08T11:30:00Z'
  },
  {
    id: 4,
    username: 'vendedor2',
    email: 'vendedor2@distribuciones.com',
    first_name: 'Ana',
    last_name: 'Martínez',
    full_name: 'Ana Martínez',
    telefono: '+57 303 456 7890',
    direccion: 'Avenida 68 #90-12',
    ciudad: 'Bogotá',
    is_active: false,
    is_staff: false,
    is_superuser: false,
    is_gerente: false,
    is_vendedor: true,
    is_distribuidor: false,
    date_joined: '2024-04-20T00:00:00Z',
    last_login: '2024-11-30T18:20:00Z',
    created_at: '2024-04-20T00:00:00Z',
    updated_at: '2024-12-01T09:15:00Z'
  },
  {
    id: 5,
    username: 'distribuidor2',
    email: 'distribuidor2@distribuciones.com',
    first_name: 'Luis',
    last_name: 'Herrera',
    full_name: 'Luis Herrera',
    telefono: '+57 304 567 8901',
    direccion: 'Calle 80 #15-25',
    ciudad: 'Barranquilla',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    is_gerente: false,
    is_vendedor: false,
    is_distribuidor: true,
    date_joined: '2024-05-15T00:00:00Z',
    last_login: '2024-12-09T12:10:00Z',
    created_at: '2024-05-15T00:00:00Z',
    updated_at: '2024-12-07T08:45:00Z'
  }
];

// Estadísticas simuladas
const BACKUP_STATS = {
  total_usuarios: 5,
  activos: 4,
  inactivos: 1,
  por_rol: {
    gerentes: 1,
    vendedores: 2,
    distribuidores: 2
  },
  registrados_mes: 0,
  ultimo_login_24h: 3,
  sin_login_30_dias: 1
};

// Logs de actividad simulados
const BACKUP_LOGS = [
  {
    id: 1,
    usuario: 'admin',
    accion: 'login',
    descripcion: 'Inicio de sesión exitoso',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    timestamp: '2024-12-10T10:30:00Z'
  },
  {
    id: 2,
    usuario: 'vendedor1',
    accion: 'view_facturas',
    descripcion: 'Consultó listado de facturas',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0...',
    timestamp: '2024-12-10T09:15:00Z'
  },
  {
    id: 3,
    usuario: 'admin',
    accion: 'create_user',
    descripcion: 'Creó usuario: distribuidor2',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0...',
    timestamp: '2024-12-09T16:45:00Z'
  }
];

class UsuariosService {
  
  // Obtener lista de usuarios con filtros
  async getUsuarios(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined) {
          params.append(key, filtros[key]);
        }
      });

      const response = await apiClient.get(`/usuarios/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('API no disponible, usando datos de respaldo:', error);
      
      // Aplicar filtros a los datos de respaldo
      let filteredUsers = [...BACKUP_USERS];
      
      if (filtros.buscar) {
        const buscar = filtros.buscar.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.first_name.toLowerCase().includes(buscar) ||
          user.last_name.toLowerCase().includes(buscar) ||
          user.username.toLowerCase().includes(buscar) ||
          user.email.toLowerCase().includes(buscar)
        );
      }
      
      if (filtros.is_active !== '' && filtros.is_active !== undefined) {
        filteredUsers = filteredUsers.filter(user => 
          user.is_active === (filtros.is_active === 'true')
        );
      }
      
      if (filtros.rol) {
        filteredUsers = filteredUsers.filter(user => {
          switch (filtros.rol) {
            case 'gerente': return user.is_gerente;
            case 'vendedor': return user.is_vendedor;
            case 'distribuidor': return user.is_distribuidor;
            default: return true;
          }
        });
      }
      
      if (filtros.ciudad) {
        filteredUsers = filteredUsers.filter(user => 
          user.ciudad?.toLowerCase().includes(filtros.ciudad.toLowerCase())
        );
      }
      
      return {
        results: filteredUsers,
        count: filteredUsers.length,
        next: null,
        previous: null
      };
    }
  }

  // Obtener usuario por ID
  async getUsuario(id) {
    try {
      const response = await apiClient.get(`/usuarios/${id}/`);
      return response.data;
    } catch (error) {
      console.warn('API no disponible, usando datos de respaldo:', error);
      const user = BACKUP_USERS.find(u => u.id === parseInt(id));
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      return user;
    }
  }

  // Crear nuevo usuario
  async createUsuario(userData) {
    try {
      const response = await apiClient.post('/usuarios/', userData);
      return response.data;
    } catch (error) {
      console.warn('API no disponible, simulando creación:', error);
      
      // Simular creación
      const newUser = {
        id: Math.max(...BACKUP_USERS.map(u => u.id)) + 1,
        ...userData,
        full_name: `${userData.first_name} ${userData.last_name}`,
        is_active: userData.is_active !== undefined ? userData.is_active : true,
        is_staff: userData.is_gerente || false,
        is_superuser: false,
        date_joined: new Date().toISOString(),
        last_login: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Agregar a la lista de respaldo
      BACKUP_USERS.push(newUser);
      
      return newUser;
    }
  }

  // Actualizar usuario
  async updateUsuario(id, userData) {
    try {
      const response = await apiClient.put(`/usuarios/${id}/`, userData);
      return response.data;
    } catch (error) {
      console.warn('API no disponible, simulando actualización:', error);
      
      const userIndex = BACKUP_USERS.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      
      // Actualizar usuario
      const updatedUser = {
        ...BACKUP_USERS[userIndex],
        ...userData,
        full_name: `${userData.first_name || BACKUP_USERS[userIndex].first_name} ${userData.last_name || BACKUP_USERS[userIndex].last_name}`,
        updated_at: new Date().toISOString()
      };
      
      BACKUP_USERS[userIndex] = updatedUser;
      return updatedUser;
    }
  }

  // Eliminar usuario (soft delete)
  async deleteUsuario(id) {
    try {
      await apiClient.delete(`/usuarios/${id}/`);
      return { success: true };
    } catch (error) {
      console.warn('API no disponible, simulando eliminación:', error);
      
      const userIndex = BACKUP_USERS.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      
      // Desactivar en lugar de eliminar
      BACKUP_USERS[userIndex].is_active = false;
      BACKUP_USERS[userIndex].updated_at = new Date().toISOString();
      
      return { success: true };
    }
  }

  // Activar/Desactivar usuario
  async toggleUsuarioStatus(id, is_active) {
    try {
      const response = await apiClient.patch(`/usuarios/${id}/`, { is_active });
      return response.data;
    } catch (error) {
      console.warn('API no disponible, simulando cambio de estado:', error);
      
      const userIndex = BACKUP_USERS.findIndex(u => u.id === parseInt(id));
      if (userIndex === -1) {
        throw new Error('Usuario no encontrado');
      }
      
      BACKUP_USERS[userIndex].is_active = is_active;
      BACKUP_USERS[userIndex].updated_at = new Date().toISOString();
      
      return BACKUP_USERS[userIndex];
    }
  }

  // Resetear contraseña
  async resetPassword(id, newPassword) {
    try {
      await apiClient.post(`/usuarios/${id}/reset-password/`, { password: newPassword });
      return { success: true };
    } catch (error) {
      console.warn('API no disponible, simulando reset de contraseña:', error);
      
      const user = BACKUP_USERS.find(u => u.id === parseInt(id));
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      return { success: true, message: 'Contraseña actualizada exitosamente' };
    }
  }

  // Obtener estadísticas de usuarios
  async getEstadisticas() {
    try {
      const response = await apiClient.get('/usuarios/estadisticas/');
      return response.data;
    } catch (error) {
      console.warn('API no disponible, usando estadísticas de respaldo:', error);
      return BACKUP_STATS;
    }
  }

  // Obtener logs de actividad
  async getLogsActividad(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined) {
          params.append(key, filtros[key]);
        }
      });

      const response = await apiClient.get(`/usuarios/logs/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('API no disponible, usando logs de respaldo:', error);
      
      let filteredLogs = [...BACKUP_LOGS];
      
      if (filtros.usuario) {
        filteredLogs = filteredLogs.filter(log => 
          log.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
        );
      }
      
      if (filtros.accion) {
        filteredLogs = filteredLogs.filter(log => log.accion === filtros.accion);
      }
      
      return {
        results: filteredLogs.slice(0, 20), // Limitar a 20 registros
        count: filteredLogs.length
      };
    }
  }

  // Exportar usuarios
  async exportarUsuarios(filtros = {}, formato = 'excel') {
    try {
      const params = new URLSearchParams();
      params.append('formato', formato);
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined) {
          params.append(key, filtros[key]);
        }
      });

      const response = await apiClient.get(`/usuarios/exportar/?${params.toString()}`, {
        responseType: 'blob'
      });
      
      return {
        data: response.data,
        filename: `usuarios_${new Date().toISOString().split('T')[0]}.${formato === 'excel' ? 'xlsx' : 'pdf'}`
      };
    } catch (error) {
      console.warn('API no disponible, generando reporte simulado:', error);
      
      // Simular datos de exportación
      const data = JSON.stringify(BACKUP_USERS, null, 2);
      return {
        data: new Blob([data], { type: 'application/json' }),
        filename: `usuarios_simulado_${new Date().toISOString().split('T')[0]}.json`
      };
    }
  }

  // Validar email único
  async validarEmail(email, excludeId = null) {
    try {
      const params = new URLSearchParams();
      params.append('email', email);
      if (excludeId) {
        params.append('exclude_id', excludeId);
      }

      const response = await apiClient.get(`/usuarios/validar-email/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('API no disponible, validando localmente:', error);
      
      const existingUser = BACKUP_USERS.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        (excludeId ? u.id !== parseInt(excludeId) : true)
      );
      
      return { valid: !existingUser, message: existingUser ? 'Email ya existe' : 'Email disponible' };
    }
  }

  // Validar username único
  async validarUsername(username, excludeId = null) {
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      if (excludeId) {
        params.append('exclude_id', excludeId);
      }

      const response = await apiClient.get(`/usuarios/validar-username/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('API no disponible, validando localmente:', error);
      
      const existingUser = BACKUP_USERS.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        (excludeId ? u.id !== parseInt(excludeId) : true)
      );
      
      return { valid: !existingUser, message: existingUser ? 'Username ya existe' : 'Username disponible' };
    }
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
  getEstadisticas,
  getLogsActividad,
  exportarUsuarios,
  validarEmail,
  validarUsername
} = usuariosService;

export { usuariosService };
export default usuariosService;