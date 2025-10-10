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
  const handleCreateFactura = () => {
    if (!isGerente()) {
      showNotification('No tienes permisos para crear facturas', 'error');
      return;
    }
    setView('create');
    setSelectedFactura(null);
  };

  // Editar factura
  const handleEditFactura = (factura) => {
    if (!isGerente()) {
      showNotification('No tienes permisos para editar facturas', 'error');
      return;
    }
    setView('edit');
    setSelectedFactura(factura);
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
      () => {
        if (isEdit) {
          return facturasService.updateFactura(selectedFactura.id, facturaData);
        } else {
          return facturasService.createFactura(facturaData);
        }
      },
      (data) => {
        const message = isEdit ? 'Factura actualizada correctamente' : 'Factura creada correctamente';
        showNotification(message, 'success');
        refreshFacturas();
        setView('list');
        navigate('/facturas');
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
        return (
          <FacturaForm
            factura={selectedFactura}
            onSave={handleSaveFactura}
            onCancel={() => handleViewChange('list')}
            loading={apiLoading}
            isEdit={view === 'edit'}
          />
        );
      
      case 'detail':
        return (
          <FacturaDetail
            factura={selectedFactura}
            onEdit={() => handleEditFactura(selectedFactura)}
            onDelete={() => handleDeleteFactura(selectedFactura)}
            onBack={() => handleViewChange('list')}
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
    </div>
  );
};

export default FacturasView;