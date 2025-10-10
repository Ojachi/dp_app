/**
 * AlertasView - Vista principal del módulo de alertas
 */
import React, { useState, useEffect } from 'react';
import { useAlertas } from '../../hooks/useAlertas';
import { useAuth } from '../../context/AuthContext';
import AlertasDashboard from './AlertasDashboard';
import AlertasList from './AlertasList';
import AlertasFilters from './AlertasFilters';
import AlertaForm from './AlertaForm';
import Modal from '../../components/Modal';
import Button from '../../components/Button';

const AlertasView = () => {
  const { user } = useAuth();
  const {
    alertas,
    contadores,
    loading,
    error,
    loadAlertas,
    loadContadores,
    marcarLeida,
    marcarVariasLeidas,
    crearAlerta,
    eliminarAlerta,
    exportarReporte,
    clearError
  } = useAlertas();

  // Estados locales
  const [vista, setVista] = useState('dashboard'); // 'dashboard' | 'lista'
  const [filtros, setFiltros] = useState({
    leida: '',
    prioridad: '',
    tipo: '',
    fecha_desde: '',
    fecha_hasta: '',
    buscar: ''
  });
  const [selectedAlertas, setSelectedAlertas] = useState([]);
  const [showModalForm, setShowModalForm] = useState(false);
  const [alertaEdit, setAlertaEdit] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (vista === 'lista') {
      loadAlertas(filtros);
    }
  }, [vista, filtros, loadAlertas]);

  // Funciones para filtros
  const handleFiltrosChange = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      leida: '',
      prioridad: '',
      tipo: '',
      fecha_desde: '',
      fecha_hasta: '',
      buscar: ''
    });
  };

  // Funciones para acciones masivas
  const handleSelectAlerta = (id, checked) => {
    setSelectedAlertas(prev => 
      checked 
        ? [...prev, id]
        : prev.filter(alertaId => alertaId !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedAlertas(checked ? alertas.map(a => a.id) : []);
  };

  const handleMarcarLeidasMasivo = async () => {
    if (selectedAlertas.length === 0) return;
    
    try {
      await marcarVariasLeidas(selectedAlertas);
      setSelectedAlertas([]);
    } catch (error) {
      console.error('Error al marcar alertas como leídas:', error);
    }
  };

  // Funciones CRUD
  const handleCrearAlerta = () => {
    setAlertaEdit(null);
    setShowModalForm(true);
  };

  const handleEditarAlerta = (alerta) => {
    setAlertaEdit(alerta);
    setShowModalForm(true);
  };

  const handleSubmitForm = async (alertaData) => {
    try {
      if (alertaEdit) {
        // Aquí iría la función de actualizar
        console.log('Actualizar alerta:', alertaData);
      } else {
        await crearAlerta(alertaData);
      }
      setShowModalForm(false);
      setAlertaEdit(null);
      
      // Recargar datos si estamos en vista lista
      if (vista === 'lista') {
        loadAlertas(filtros);
      }
      loadContadores();
    } catch (error) {
      console.error('Error al guardar alerta:', error);
    }
  };

  const handleEliminarAlerta = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta alerta?')) {
      return;
    }

    try {
      await eliminarAlerta(id);
      setSelectedAlertas(prev => prev.filter(alertaId => alertaId !== id));
    } catch (error) {
      console.error('Error al eliminar alerta:', error);
    }
  };

  // Función para exportar
  const handleExportar = async (formato = 'excel') => {
    try {
      const resultado = await exportarReporte(filtros, formato);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([resultado.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resultado.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h2 className="h3 mb-0">Alertas y Notificaciones</h2>
          <p className="text-muted">Gestión de alertas del sistema</p>
        </div>
        <div className="col-md-6 text-end">
          {/* Botones de vista */}
          <div className="btn-group me-3" role="group">
            <Button
              variant={vista === 'dashboard' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setVista('dashboard')}
            >
              <i className="bi bi-speedometer2 me-1"></i>
              Dashboard
            </Button>
            <Button
              variant={vista === 'lista' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setVista('lista')}
            >
              <i className="bi bi-list-ul me-1"></i>
              Lista
            </Button>
          </div>

          {/* Botones de acción */}
          {user?.is_gerente && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCrearAlerta}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Nueva Alerta
            </Button>
          )}
        </div>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
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
      {vista === 'dashboard' ? (
        <AlertasDashboard contadores={contadores} />
      ) : (
        <>
          {/* Barra de herramientas para lista */}
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="bi bi-funnel me-1"></i>
                  Filtros
                </Button>
                
                {selectedAlertas.length > 0 && (
                  <>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={handleMarcarLeidasMasivo}
                    >
                      <i className="bi bi-check-all me-1"></i>
                      Marcar leídas ({selectedAlertas.length})
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="col-md-6 text-end">
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
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <AlertasFilters
              filtros={filtros}
              onFiltrosChange={handleFiltrosChange}
              onLimpiar={limpiarFiltros}
            />
          )}

          {/* Lista de alertas */}
          <AlertasList
            alertas={alertas}
            loading={loading}
            selectedAlertas={selectedAlertas}
            onSelectAlerta={handleSelectAlerta}
            onSelectAll={handleSelectAll}
            onMarcarLeida={marcarLeida}
            onEditar={handleEditarAlerta}
            onEliminar={handleEliminarAlerta}
            canEdit={user?.is_gerente}
            canDelete={user?.is_gerente}
          />
        </>
      )}

      {/* Modal de formulario */}
      <Modal
        show={showModalForm}
        onHide={() => {
          setShowModalForm(false);
          setAlertaEdit(null);
        }}
        title={alertaEdit ? 'Editar Alerta' : 'Nueva Alerta'}
        size="lg"
      >
        <AlertaForm
          alerta={alertaEdit}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setShowModalForm(false);
            setAlertaEdit(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default AlertasView;