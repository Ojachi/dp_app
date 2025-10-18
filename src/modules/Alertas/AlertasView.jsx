/**
 * AlertasView - Vista simplificada para revisar notificaciones generadas por el backend
 */
import React, { useEffect, useState } from 'react';
import { useAlertas } from '../../hooks/useAlertas';
import { useAuth } from '../../context/AuthContext';
import AlertasList from './AlertasList';
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
    marcarNoLeida,
    crearAlerta,
    eliminarAlerta,
    clearError
  } = useAlertas();

  const [searchTerm, setSearchTerm] = useState('');
  const [showModalForm, setShowModalForm] = useState(false);

  useEffect(() => {
    loadAlertas();
    loadContadores();
  }, [loadAlertas, loadContadores]);

  const handleBuscarAlertas = (event) => {
    event.preventDefault();
    loadAlertas({ buscar: searchTerm.trim() });
  };

  const handleLimpiarBusqueda = () => {
    setSearchTerm('');
    loadAlertas();
    loadContadores();
  };

  const handleRecargar = () => {
    loadAlertas({ buscar: searchTerm.trim() || undefined });
    loadContadores();
  };

  // const handleCrearAlerta = () => {
  //   setShowModalForm(true);
  // };

  const handleSubmitForm = async (alertaData) => {
    try {
      await crearAlerta(alertaData);
      setShowModalForm(false);
      handleRecargar();
    } catch (submitError) {
      console.error('Error al guardar alerta:', submitError);
    }
  };

  const handleEliminarAlerta = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta alerta?')) {
      return;
    }

    try {
      await eliminarAlerta(id);
      handleRecargar();
    } catch (deleteError) {
      console.error('Error al eliminar alerta:', deleteError);
    }
  };

  const handleToggleLectura = async (alerta) => {
    try {
      if (alerta.leida) {
        await marcarNoLeida(alerta.id);
      } else {
        await marcarLeida(alerta.id);
      }
    } catch (toggleError) {
      console.error('Error al actualizar estado de alerta:', toggleError);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-md-7">
          <h2 className="h3 mb-0">Alertas del sistema</h2>
          <p className="text-muted mb-0">Revisa los avisos generados automáticamente por la plataforma.</p>
        </div>
        <div className="col-md-5 text-md-end mt-3 mt-md-0">
          <div className="d-inline-flex gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleRecargar}
              disabled={loading}
            >
              <i className="fas fa-refresh " ></i>
              Actualizar
            </Button>
            {/* {user?.is_gerente && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleCrearAlerta}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Nueva alerta
              </Button>
            )} */}
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={clearError}
            aria-label="Cerrar"
          ></button>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <form className="row g-2 align-items-center" onSubmit={handleBuscarAlertas}>
            <div className="col-sm-6 col-md-8">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por título o mensaje"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6 col-md-4 text-sm-end">
              <div className="d-inline-flex gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={loading}>
                  Buscar
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={handleLimpiarBusqueda}
                  disabled={!searchTerm || loading}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {contadores && (
        <div className="row g-3 mb-3">
          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <span className="text-muted d-block">Total de alertas</span>
                <h4 className="mb-0">{contadores.total ?? 0}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <span className="text-muted d-block">Sin leer</span>
                <h4 className="mb-0 text-danger">{contadores.no_leidas ?? 0}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <span className="text-muted d-block">Recientes</span>
                <h4 className="mb-0 text-primary">{contadores.recientes ?? 0}</h4>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <span className="text-muted d-block">Prioridad alta</span>
                <h4 className="mb-0 text-warning">{contadores.por_prioridad?.alta ?? 0}</h4>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertasList
        alertas={alertas}
        loading={loading}
        onToggleLectura={handleToggleLectura}
        onEliminar={handleEliminarAlerta}
        canManage={Boolean(user?.is_gerente)}
      />

      <Modal
        show={showModalForm}
        onHide={() => {
          setShowModalForm(false);
        }}
        title="Nueva alerta"
        size="lg"
      >
        <AlertaForm
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setShowModalForm(false);
          }}
        />
      </Modal>
    </div>
  );
};

export default AlertasView;