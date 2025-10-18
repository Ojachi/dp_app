/**
 * UsuariosList - Lista de usuarios con funcionalidades completas
 */
import React from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Checkbox from '../../components/Checkbox';

const UsuariosList = ({
  usuarios,
  loading,
  selectedUsuarios,
  onSelectUsuario,
  onSelectAll,
  onEditar,
  onEliminar,
  onToggleStatus,
  onResetPassword
}) => {

  // Función para obtener el badge de rol
  const getRoleBadge = (usuario) => {
    if (usuario.roles.includes('Gerente')) {
      return <span className="badge bg-success">Gerente</span>;
    }
    if (usuario.roles.includes('Vendedor')) {
      return <span className="badge bg-primary">Vendedor</span>;
    }
    if (usuario.roles.includes('Distribuidor')) {
      return <span className="badge bg-info">Distribuidor</span>;
    }
    return <span className="badge bg-secondary">Usuario</span>;
  };

  // Función para obtener el badge de estado
  const getEstadoBadge = (is_active) => {
    return (
      <span className={`badge ${is_active ? 'bg-success' : 'bg-secondary'}`}>
        {is_active ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  // Configuración de columnas
  const columns = [
    {
      key: 'select',
      header: (
        <Checkbox
          checked={selectedUsuarios.length === usuarios.length && usuarios.length > 0}
          indeterminate={selectedUsuarios.length > 0 && selectedUsuarios.length < usuarios.length}
          onChange={(e) => onSelectAll(e.target.checked)}
        />
      ),
      render: (usuario) => (
        <Checkbox
          checked={selectedUsuarios.includes(usuario.id)}
          onChange={(e) => onSelectUsuario(usuario.id, e.target.checked)}
        />
      ),
      width: '50px'
    },
    {
      key: 'avatar',
      header: 'Avatar',
      render: (usuario) => (
        <div className="d-flex align-items-center justify-content-center">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
               style={{ width: '35px', height: '35px', fontSize: '14px' }}>
            {usuario.first_name?.charAt(0)}{usuario.last_name?.charAt(0)}
          </div>
        </div>
      ),
      width: '60px'
    },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (usuario) => (
        <div>
          <div className="fw-semibold">{usuario.first_name} {usuario.last_name}</div>
          <div className="text-muted small">@{usuario.username}</div>
        </div>  
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (usuario) => usuario.email,
      width: '220px'
    },
    {
      key: 'rol',
      header: 'Rol',
      render: (usuario) => getRoleBadge(usuario),
      width: '120px'
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (usuario) => getEstadoBadge(usuario.is_active),
      width: '100px'
    },
    // {
    //   key: 'fecha_registro',
    //   header: 'Registro',
    //   render: (usuario) => (
    //     <small>{formatFecha(usuario.date_joined)}</small>
    //   ),
    //   width: '120px'
    // },
    // {
    //   key: 'ultimo_login',
    //   header: 'Último Login',
    //   render: (usuario) => (
    //     <small className={usuario.last_login ? 'text-success' : 'text-warning'}>
    //       {formatFecha(usuario.last_login)}
    //     </small>
    //   ),
    //   width: '120px'
    // },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (usuario) => (
        <div className="d-flex gap-1">
          {/* Editar */}
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onEditar(usuario)}
            title="Editar usuario"
          >
            <i className="fas fa-pencil-alt"></i>
          </Button>

          {/* Activar/Desactivar */}
          <Button
            variant={usuario.is_active ? "outline-warning" : "outline-success"}
            size="sm"
            onClick={() => onToggleStatus(usuario.id, !usuario.is_active)}
            title={usuario.is_active ? "Desactivar" : "Activar"}
          >
            <i className={`fas fa-${usuario.is_active ? 'pause' : 'play'}`}></i>
          </Button>

          {/* Reset Password */}
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => onResetPassword(usuario)}
            title="Resetear contraseña"
          >
            <i className="fas fa-key"></i>
          </Button>

          {/* Eliminar (desactivar) */}
          {usuario.is_active && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onEliminar(usuario.id)}
              title="Eliminar usuario"
            >
              <i className="fas fa-user-minus"></i>
            </Button>
          )}
        </div>
      ),
      width: '150px'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">
            <i className="bi bi-people me-2"></i>
            Listado de Usuarios
          </h5>
          <div className="d-flex gap-2 align-items-center">
            <span className="badge bg-secondary">
              {usuarios.length} usuarios
            </span>
            <span className="badge bg-success">
              {usuarios.filter(u => u.is_active).length} activos
            </span>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <Table
          columns={columns}
          data={usuarios}
          loading={loading}
          emptyMessage="No se encontraron usuarios"
          responsive
          hover
          className="mb-100"
        />
      </div>

      {/* Información adicional */}
      {usuarios.length > 0 && (
        <div className="card-footer text-muted">
          <div className="row">
            <div className="col-md-4">
              <small>
                <i className="bi bi-info-circle me-1"></i>
                Seleccionados: {selectedUsuarios.length} de {usuarios.length}
              </small>
            </div>
            <div className="col-md-4 text-center">
              <small>
                <i className="bi bi-check-circle text-success me-1"></i>
                Activos: {usuarios.filter(u => u.is_active).length}
              </small>
            </div>
            <div className="col-md-4 text-end">
              <small>
                <i className="bi bi-pause-circle text-warning me-1"></i>
                Inactivos: {usuarios.filter(u => !u.is_active).length}
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosList;