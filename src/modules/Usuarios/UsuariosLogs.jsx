/**
 * UsuariosLogs - Logs de actividad de usuarios
 */
import React, { useState, useEffect } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import Table from '../../components/Table';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';

const UsuariosLogs = () => {
  const { logs, loadLogs } = useUsuarios();
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    usuario: '',
    accion: ''
  });

  // Cargar logs al inicializar
  useEffect(() => {
    cargarLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      await loadLogs(filtros);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    cargarLogs();
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      usuario: '',
      accion: ''
    });
    loadLogs({});
  };

  // Función para obtener el badge de acción
  const getAccionBadge = (accion) => {
    const colores = {
      login: 'success',
      logout: 'secondary',
      create_user: 'primary',
      update_user: 'info',
      delete_user: 'danger',
      view_facturas: 'light',
      create_factura: 'success',
      update_factura: 'warning',
      view_pagos: 'light',
      create_pago: 'success'
    };

    const nombres = {
      login: 'Login',
      logout: 'Logout',
      create_user: 'Crear Usuario',
      update_user: 'Editar Usuario',
      delete_user: 'Eliminar Usuario',
      view_facturas: 'Ver Facturas',
      create_factura: 'Crear Factura',
      update_factura: 'Editar Factura',
      view_pagos: 'Ver Pagos',
      create_pago: 'Crear Pago'
    };

    return (
      <span className={`badge bg-${colores[accion] || 'secondary'} text-${colores[accion] === 'light' ? 'dark' : 'white'}`}>
        {nombres[accion] || accion}
      </span>
    );
  };

  // Función para formatear fecha
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Opciones para el filtro de acciones
  const opcionesAcciones = [
    { value: '', label: 'Todas las acciones' },
    { value: 'login', label: 'Login' },
    { value: 'logout', label: 'Logout' },
    { value: 'create_user', label: 'Crear Usuario' },
    { value: 'update_user', label: 'Editar Usuario' },
    { value: 'delete_user', label: 'Eliminar Usuario' },
    { value: 'view_facturas', label: 'Ver Facturas' },
    { value: 'create_factura', label: 'Crear Factura' },
    { value: 'view_pagos', label: 'Ver Pagos' },
    { value: 'create_pago', label: 'Crear Pago' }
  ];

  // Configuración de columnas
  const columns = [
    {
      key: 'timestamp',
      header: 'Fecha/Hora',
      render: (log) => (
        <div className="small">
          {formatFecha(log.timestamp)}
        </div>
      ),
      width: '150px'
    },
    {
      key: 'usuario',
      header: 'Usuario',
      render: (log) => (
        <div className="fw-semibold">
          {log.usuario}
        </div>
      ),
      width: '120px'
    },
    {
      key: 'accion',
      header: 'Acción',
      render: (log) => getAccionBadge(log.accion),
      width: '150px'
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      render: (log) => (
        <div className="text-truncate" style={{ maxWidth: '300px' }}>
          {log.descripcion}
        </div>
      )
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (log) => (
        <small className="text-muted">
          {log.ip_address}
        </small>
      ),
      width: '120px'
    },
    {
      key: 'user_agent',
      header: 'Navegador',
      render: (log) => {
        const browser = log.user_agent?.includes('Chrome') ? 'Chrome' :
                       log.user_agent?.includes('Firefox') ? 'Firefox' :
                       log.user_agent?.includes('Safari') ? 'Safari' :
                       log.user_agent?.includes('Edge') ? 'Edge' : 'Otro';
        return (
          <small className="text-muted">
            {browser}
          </small>
        );
      },
      width: '100px'
    }
  ];

  return (
    <div className="row">
      {/* Filtros */}
      <div className="col-12 mb-3">
        <div className="card">
          <div className="card-header">
            <h6 className="card-title mb-0">
              <i className="bi bi-funnel me-2"></i>
              Filtros de Logs
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <Input
                  label="Usuario"
                  placeholder="Nombre de usuario..."
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Select
                  label="Acción"
                  value={filtros.accion}
                  onChange={(e) => handleFiltroChange('accion', e.target.value)}
                  options={opcionesAcciones}
                />
              </div>
              <div className="col-md-6 d-flex align-items-end gap-2">
                <Button
                  variant="primary"
                  onClick={aplicarFiltros}
                  disabled={loading}
                >
                  <i className="bi bi-search me-1"></i>
                  Buscar
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={limpiarFiltros}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de logs */}
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-journal-text me-2"></i>
                Registro de Actividad
              </h5>
              <span className="badge bg-secondary">
                {logs.length} registros
              </span>
            </div>
          </div>

          <div className="card-body p-0">
            <Table
              columns={columns}
              data={logs}
              loading={loading}
              emptyMessage="No se encontraron logs de actividad"
              responsive
              hover
              className="mb-0"
            />
          </div>

          {/* Footer informativo */}
          {logs.length > 0 && (
            <div className="card-footer text-muted">
              <div className="row">
                <div className="col-md-6">
                  <small>
                    <i className="bi bi-info-circle me-1"></i>
                    Mostrando los últimos {logs.length} registros de actividad
                  </small>
                </div>
                <div className="col-md-6 text-end">
                  <small>
                    <i className="bi bi-clock me-1"></i>
                    Actualizado automáticamente
                  </small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuariosLogs;