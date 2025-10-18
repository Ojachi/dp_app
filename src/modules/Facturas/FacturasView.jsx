/**
 * Vista principal del módulo de Facturas
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFacturas } from '../../hooks/useFacturas';
import { useApi } from '../../hooks/useApi';
import { facturasService } from '../../services/facturasService';
import FacturasTable from './components/FacturasTable';
import FacturasFilters from './components/FacturasFilters';
import FacturaForm from './components/FacturaForm';
import { entidadesService } from '../../services/entidadesService';
import FacturaDetail from './components/FacturaDetail';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const FacturasView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isGerente } = useAuth();
  const { execute, loading: apiLoading } = useApi();
  
  // Estados locales
  const [view, setView] = useState(id ? 'detail' : 'list'); // 'list', 'create', 'edit', 'detail'
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [entidades, setEntidades] = useState({ clientes: [], vendedores: [], distribuidores: [] });

  // Cargar entidades de apoyo (clientes, vendedores, distribuidores)
  const loadEntidades = async () => {
    try {
      const [clientes, vendedores, distribuidores] = await Promise.all([
        entidadesService.clientes.getAll(),
        entidadesService.vendedores.getAll(),
        entidadesService.distribuidores.getAll(),
      ]);
      const toArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        return [];
      };
      setEntidades({
        clientes: toArray(clientes),
        vendedores: toArray(vendedores),
        distribuidores: toArray(distribuidores)
      });
    } catch (e) {
      console.error('Error cargando entidades:', e);
    }
  };

  useEffect(() => {
    // Pre-cargar entidades para filtros y formularios
    loadEntidades();
  }, []);

  const openFacturaModal = (mode) => setView(mode); // 'create' | 'edit'
  const closeFacturaModal = () => setView('list');

  // Hook para manejo de facturas
  const {
    facturas,
    loading,
    error,
    filters,
    pagination,
    applyFilters,
    clearFilters,
    refreshFacturas
  } = useFacturas();

  // Cargar factura específica si hay ID en la URL
  useEffect(() => {
    const loadDetail = async (facturaId) => {
      await execute(
        () => facturasService.getFacturaById(facturaId),
        (data) => {
          setSelectedFactura(data);
        },
        (error) => {
          console.error('Error cargando factura:', error);
          setView('list');
          navigate('/facturas');
        }
      );
    };

    if (id && view === 'detail') {
      loadDetail(id);
    }
  }, [id, view, execute, navigate]);



  // Cambiar vista
  const handleViewChange = (newView, factura = null) => {
    setView(newView);
    setSelectedFactura(factura);
    
    // Actualizar URL
    if (newView === 'detail' && factura) {
      navigate(`/facturas/${factura.id}`);
    } else if (newView === 'list') {
      navigate('/facturas');
    }
  };

  // Crear nueva factura
  const handleCreateFactura = async () => {
    if (!isGerente()) {
      showNotification('No tienes permisos para crear facturas', 'error');
      return;
    }
    setSelectedFactura(null);
    await loadEntidades();
    openFacturaModal('create');
  };

  // Editar factura
  const handleEditFactura = async (factura) => {
    if (!isGerente()) {
      showNotification('No tienes permisos para editar facturas', 'error');
      return;
    }
    setSelectedFactura(factura);
    await loadEntidades();
    openFacturaModal('edit');
  };

  // Eliminar factura
  const handleDeleteFactura = async (factura) => {
    if (!isGerente()) {
      showNotification('No tienes permisos para eliminar facturas', 'error');
      return;
    }

    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la factura ${factura.numero_factura}?`
    );
    
    if (confirmed) {
      await execute(
        () => facturasService.deleteFactura(factura.id),
        () => {
          showNotification('Factura eliminada correctamente', 'success');
          refreshFacturas();
          setView('list');
          navigate('/facturas');
        }
      );
    }
  };

  // Guardar factura (crear o editar)
  const handleSaveFactura = async (facturaData) => {
    const isEdit = view === 'edit' && selectedFactura;
    
    await execute(
      async () => {
        const payload = { ...facturaData };
        // Si viene un cliente nuevo desde el formulario, crearlo primero
        if (payload.cliente_nuevo) {
          const nuevo = await entidadesService.clientes.create(payload.cliente_nuevo);
          payload.cliente_id = nuevo.id;
          delete payload.cliente_nuevo;
        }

        if (isEdit) {
          return facturasService.updateFactura(selectedFactura.id, payload);
        } else {
          return facturasService.createFactura(payload);
        }
      },
      (data) => {
        const message = isEdit ? 'Factura actualizada correctamente' : 'Factura creada correctamente';
        showNotification(message, 'success');
        refreshFacturas();
        closeFacturaModal();
      }
    );
  };

  // Mostrar notificación
  const showNotification = (message, type = 'info') => {
    setModalContent({
      type: 'notification',
      title: type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : 'Información',
      message,
      variant: type
    });
    setShowModal(true);
  };

  // Renderizar contenido según la vista actual
  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner message="Cargando facturas..." />;
    }

    switch (view) {
      case 'create':
      case 'edit':
        // En modalidad modal, caemos al default (lista) y mostramos el modal aparte
        return null;

      case 'detail':
        return (
          <FacturaDetail
            factura={selectedFactura}
            onEdit={() => handleEditFactura(selectedFactura)}
            onDelete={() => handleDeleteFactura(selectedFactura)}
            onClose={() => handleViewChange('list')}
            loading={apiLoading}
          />
        );
      
      default:
        return (
          <div>
            {/* Filtros */}
            <FacturasFilters
              filters={filters}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
              entidades={entidades}
              onCreateFactura={handleCreateFactura}
              canCreate={isGerente()}
            />

            {/* Tabla de facturas */}
            <FacturasTable
              facturas={facturas}
              pagination={pagination}
              onViewDetail={(factura) => handleViewChange('detail', factura)}
              onEdit={handleEditFactura}
              onDelete={handleDeleteFactura}
              canEdit={isGerente()}
              canDelete={isGerente()}
              loading={loading}
              error={error}
            />
          </div>
        );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="fas fa-file-invoice me-2 text-primary"></i>
            {view === 'create' ? 'Nueva Factura' : 
             view === 'edit' ? 'Editar Factura' : 
             view === 'detail' ? 'Detalle de Factura' : 'Gestión de Facturas'}
          </h2>
          <p className="text-muted mb-0">
            {view === 'list' ? `${facturas.length} facturas encontradas` : 
             view === 'detail' && selectedFactura ? `Factura ${selectedFactura.numero_factura}` :
             'Administra las facturas del sistema'}
          </p>
        </div>
        <div className="d-flex gap-2">
          {view === 'list' && isGerente() && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => handleCreateFactura()}
              >
                <i className="fas fa-plus me-2"></i>
                Agregar Factura
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigate('/importacion')}
              >
                <i className="fas fa-file-import me-2"></i>
                Importar
              </button>
            </>
          )}
          {view !== 'list' && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => handleViewChange('list')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Volver a la lista
            </button>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      {renderContent()}

      {/* Modal para notificaciones */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title={modalContent?.title}
        size="sm"
      >
        {modalContent?.type === 'notification' && (
          <div className="text-center py-3">
            <i className={`fas ${
              modalContent.variant === 'success' ? 'fa-check-circle text-success' :
              modalContent.variant === 'error' ? 'fa-exclamation-triangle text-danger' :
              'fa-info-circle text-info'
            } fa-3x mb-3`}></i>
            <p className="mb-3">{modalContent.message}</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(false)}
            >
              Entendido
            </button>
          </div>
        )}
      </Modal>

      {/* Modal para crear/editar factura */}
      <Modal
        show={view === 'create' || view === 'edit'}
        onHide={() => handleViewChange('list')}
        title={view === 'edit' ? 'Editar Factura' : 'Nueva Factura'}
        size="xl"
        bodyClassName="p-0"
      >
        <div className="p-3">
          <FacturaForm
            factura={selectedFactura}
            entidades={entidades}
            onSave={handleSaveFactura}
            onCancel={() => handleViewChange('list')}
            loading={apiLoading}
            isEdit={view === 'edit'}
          />
        </div>
      </Modal>
    </div>
  );
};

export default FacturasView;