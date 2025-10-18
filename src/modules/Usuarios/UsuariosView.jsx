/**
 * UsuariosView - Vista principal del módulo de gestión de usuarios
 */
import React, { useState, useEffect } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import { useAuth } from '../../context/AuthContext';
// MVP: ocultar dashboard y logs; mantener lista y formulario
import UsuariosList from './UsuariosList';
import UsuariosFilters from './UsuariosFilters';
import UsuarioForm from './UsuarioForm';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { useToast } from '../../components/Toast';

const UsuariosView = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    usuarios,
  // estadisticas,
    loading,
    error,
    loadUsuarios,
    //loadEstadisticas,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    toggleUsuarioStatus,
    resetearPassword,
    //exportarUsuarios,
    clearError
  } = useUsuarios();

  // Estados locales
  // MVP: solo 'lista'
  const [vista] = useState('lista');
  const [filtros, setFiltros] = useState({
    buscar: '',
    is_active: '',
    rol: ''
  });
  const [selectedUsuarios, setSelectedUsuarios] = useState([]);
  const [showModalForm, setShowModalForm] = useState(false);
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [usuarioPassword, setUsuarioPassword] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    if (vista === 'lista') {
      loadUsuarios(filtros);
    }
  }, [vista, filtros, loadUsuarios]);

  // Funciones para filtros
  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      buscar: '',
      is_active: '',
      rol: ''
    });
  };

  // Funciones para selección múltiple
  const handleSelectUsuario = (id, checked) => {
    setSelectedUsuarios(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(usuarioId => usuarioId !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedUsuarios(checked ? usuarios.map(u => u.id) : []);
  };

  // Funciones CRUD
  const handleCrearUsuario = () => {
    setUsuarioEdit(null);
    setShowModalForm(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEdit(usuario);
    setShowModalForm(true);
  };

  const handleSubmitForm = async (usuarioData) => {
    try {
      if (usuarioEdit) {
        await actualizarUsuario(usuarioEdit.id, usuarioData);
      } else {
        await crearUsuario(usuarioData);
      }
      setShowModalForm(false);
      setUsuarioEdit(null);
      
      // Recargar datos si estamos en vista lista
      if (vista === 'lista') {
        loadUsuarios(filtros);
      }
      //loadEstadisticas();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const handleEliminarUsuario = async (id) => {
    if (!window.confirm('¿Está seguro de que desea desactivar este usuario?')) {
      return;
    }

    try {
      await eliminarUsuario(id);
      setSelectedUsuarios(prev => prev.filter(usuarioId => usuarioId !== id));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  };

  const handleToggleStatus = async (id, is_active) => {
    try {
      await toggleUsuarioStatus(id, is_active);
      
      // Recargar si estamos en vista lista
      if (vista === 'lista') {
        loadUsuarios(filtros);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const handleResetPassword = (usuario) => {
    setUsuarioPassword(usuario);
    setShowPasswordModal(true);
  };

  const handleSubmitPassword = async (password) => {
    try {
      await resetearPassword(usuarioPassword.id, password);
      setShowPasswordModal(false);
      setUsuarioPassword(null);
      toast.success('Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error al resetear contraseña:', error);
      toast.error('Error al resetear contraseña');
    }
  };

  // Función para exportar
  // const handleExportar = async (formato = 'excel') => {
  //   try {
  //     const resultado = await exportarUsuarios(filtros, formato);
      
  //     // Crear enlace de descarga
  //     const url = window.URL.createObjectURL(new Blob([resultado.data]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', resultado.filename);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (error) {
  //     console.error('Error al exportar:', error);
  //   }
  // };

  // Verificar permisos (solo gerentes pueden acceder)
  if (!user?.is_gerente) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No tiene permisos para acceder a este módulo.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h2 className="h3 mb-0">Gestión de Usuarios</h2>
          <p className="text-muted">Administración de usuarios del sistema</p>
        </div>
        <div className="col-md-6 text-end">
          {/* Botón crear usuario */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleCrearUsuario}
          >
            <i className="fas fa-user-plus me-1"></i>
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearError}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Contenido principal */}
      {vista === 'lista' && (
        <>
          {/* Barra de herramientas */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="fas fa-filter me-1"></i>
                  Filtros
                </Button>
                
                {selectedUsuarios.length > 0 && (
                  <span className="badge bg-primary align-self-center">
                    {selectedUsuarios.length} seleccionados
                  </span>
                )}
              </div>
            </div>
            {/* <div className="col-md-6 text-end">
              <div className="btn-group" role="group">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleExportar('excel')}
                  disabled={loading}
                >
                  <i className="bi bi-file-earmark-excel me-1"></i>
                  Excel
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleExportar('pdf')}
                  disabled={loading}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  PDF
                </Button>
              </div>
            </div> */}
          </div>

          {/* Filtros */}
          {showFilters && (
            <UsuariosFilters
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              onLimpiar={limpiarFiltros}
            />
          )}

          {/* Lista de usuarios */}
          <UsuariosList
            usuarios={usuarios}
            loading={loading}
            selectedUsuarios={selectedUsuarios}
            onSelectUsuario={handleSelectUsuario}
            onSelectAll={handleSelectAll}
            onEditar={handleEditarUsuario}
            onEliminar={handleEliminarUsuario}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
          />
        </>
      )}

      {/* Modal de formulario */}
      <Modal
        show={showModalForm}
        onHide={() => {
          setShowModalForm(false);
          setUsuarioEdit(null);
        }}
        title={usuarioEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
        size="lg"
      >
        <UsuarioForm
          usuario={usuarioEdit}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setShowModalForm(false);
            setUsuarioEdit(null);
          }}
        />
      </Modal>

      {/* Modal de contraseña */}
      <Modal
        show={showPasswordModal}
        onHide={() => {
          setShowPasswordModal(false);
          setUsuarioPassword(null);
        }}
        title="Resetear Contraseña"
        size="sm"
      >
        <PasswordResetForm
          usuario={usuarioPassword}
          onSubmit={handleSubmitPassword}
          onCancel={() => {
            setShowPasswordModal(false);
            setUsuarioPassword(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Componente auxiliar para resetear contraseña
const PasswordResetForm = ({ usuario, onSubmit, onCancel }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <p className="text-muted">
          Resetear contraseña para: <strong>{usuario?.full_name}</strong>
        </p>
      </div>
      
      <div className="mb-3">
        <label className="form-label">Nueva Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>
      
      <div className="mb-3">
        <label className="form-label">Confirmar Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repetir contraseña"
          required
        />
      </div>
      
      {error && (
        <div className="alert alert-danger">{error}</div>
      )}
      
      <div className="d-flex gap-2 justify-content-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Resetear Contraseña
        </Button>
      </div>
    </form>
  );
};

export default UsuariosView;