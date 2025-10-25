/**
 * Hook personalizado para gestión de usuarios
 */
import { useState, useCallback } from 'react';
import { usuariosService } from '../services/usuariosService';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuarios
  const loadUsuarios = useCallback(async (filtros = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usuariosService.getUsuarios(filtros);
      setUsuarios(response);
      return response;
    } catch (err) {
      setError(err.message);
      setUsuarios([]);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener usuario por ID
  const getUsuario = useCallback(async (id) => {
    try {
      setError(null);
      const usuario = await usuariosService.getUsuario(id);
      return usuario;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Crear usuario
  const crearUsuario = useCallback(async (userData) => {
    try {
      setError(null);
      const nuevoUsuario = await usuariosService.createUsuario(userData);
      
      // Agregar a la lista local
      setUsuarios(prev => [nuevoUsuario, ...prev]);
      return nuevoUsuario;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Actualizar usuario
  const actualizarUsuario = useCallback(async (id, userData) => {
    try {
      setError(null);
      const usuarioActualizado = await usuariosService.updateUsuario(id, userData);
      
      // Actualizar en la lista local
      setUsuarios(prev => prev.map(usuario => 
        usuario.id === id ? usuarioActualizado : usuario
      ));
      
      return usuarioActualizado;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Eliminar usuario
  const eliminarUsuario = useCallback(async (id) => {
    try {
      setError(null);
      await usuariosService.deleteUsuario(id);
      
      // Actualizar lista local (marcar como inactivo)
      setUsuarios(prev => prev.map(usuario => 
        usuario.id === id 
          ? { ...usuario, is_active: false, updated_at: new Date().toISOString() }
          : usuario
      ));
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Activar/Desactivar usuario
  const toggleUsuarioStatus = useCallback(async (id, is_active) => {
    try {
      setError(null);
      const usuarioActualizado = await usuariosService.toggleUsuarioStatus(id, is_active);
      
      // Actualizar en la lista local
      setUsuarios(prev => prev.map(usuario => 
        usuario.id === id ? usuarioActualizado : usuario
      ));
      return usuarioActualizado;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Resetear contraseña
  const resetearPassword = useCallback(async (id, newPassword) => {
    try {
      setError(null);
      const result = await usuariosService.resetPassword(id, newPassword);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  // Validar email único
  const validarEmail = useCallback(async (email, excludeId = null) => {
    try {
      const result = await usuariosService.validarEmail(email, excludeId);
      return result;
    } catch (err) {
      console.error('Error al validar email:', err);
      return { valid: false, message: 'Error de validación' };
    }
  }, []);

  // Validar username único
  const validarUsername = useCallback(async (username, excludeId = null) => {
    try {
      const result = await usuariosService.validarUsername(username, excludeId);
      return result;
    } catch (err) {
      console.error('Error al validar username:', err);
      return { valid: false, message: 'Error de validación' };
    }
  }, []);

  // Obtener rol de usuario formateado
  const getUserRole = useCallback((usuario) => {
    if (usuario.is_gerente) return { key: 'gerente', label: 'Gerente', color: 'success' };
    if (usuario.is_vendedor) return { key: 'vendedor', label: 'Vendedor', color: 'primary' };
    if (usuario.is_distribuidor) return { key: 'distribuidor', label: 'Distribuidor', color: 'info' };
    return { key: 'usuario', label: 'Usuario', color: 'secondary' };
  }, []);

  // Obtener usuarios por rol
  const getUsuariosPorRol = useCallback((rol) => {
    switch (rol) {
      case 'gerente':
        return usuarios.filter(u => u.is_gerente);
      case 'vendedor':
        return usuarios.filter(u => u.is_vendedor);
      case 'distribuidor':
        return usuarios.filter(u => u.is_distribuidor);
      default:
        return usuarios;
    }
  }, [usuarios]);

  return {
    // Estado
    usuarios,
    loading,
    error,
    
    // Acciones CRUD
    loadUsuarios,
    getUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    
    // Acciones específicas
    toggleUsuarioStatus,
    resetearPassword,
    
    // Validaciones
    validarEmail,
    validarUsername,
    
    // Utilidades
    getUserRole,
    getUsuariosPorRol,
    clearError: () => setError(null),
    setUsuarios,
  };
};