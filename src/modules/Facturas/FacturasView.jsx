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
// import FacturasFilters from './components/FacturasFilters';
import FacturaForm from './components/FacturaForm';
import { entidadesService } from '../../services/entidadesService';
import FacturaDetail from './components/FacturaDetail';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import SearchBar from '../../components/SearchBar';
import FiltersSidebar from '../../components/FiltersSidebar';

const FacturasView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isGerente, isDistribuidor, isVendedor } = useAuth();
  const { execute, loading: apiLoading } = useApi();
  
  // Estados locales
  const [view, setView] = useState(id ? 'detail' : 'list'); // 'list', 'create', 'edit', 'detail'
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [entidades, setEntidades] = useState({ clientes: [], vendedores: [], distribuidores: [], poblaciones: [] });

  // Cargar entidades de apoyo (clientes, vendedores, distribuidores)
  const loadEntidades = async () => {
    try {
      const [clientes, vendedores, distribuidores, poblaciones] = await Promise.all([
        entidadesService.clientes.getAll(),
        entidadesService.vendedores.getAll(),
        entidadesService.distribuidores.getAll(),
        entidadesService.poblaciones.getAll(),
      ]);
      const toArray = (data) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        return [];
      };
      setEntidades({
        clientes: toArray(clientes),
        vendedores: toArray(vendedores),
        distribuidores: toArray(distribuidores),
        poblaciones: toArray(poblaciones)
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

  // Callback cuando un detalle de factura se actualiza (ej. estado_entrega)
  const handleFacturaUpdated = async (partialUpdate) => {
    try {
      // Refrescar lista general para reflejar cambios (estado, entrega)
      await refreshFacturas();
      // Si estamos viendo el detalle, recargar la factura actualizada desde backend
      if (selectedFactura?.id) {
        const data = await facturasService.getFacturaById(selectedFactura.id);
        setSelectedFactura(data);
      } else if (partialUpdate?.id) {
        const data = await facturasService.getFacturaById(partialUpdate.id);
        setSelectedFactura(data);
      }
    } catch (e) {
      console.error('Error refrescando factura actualizada:', e);
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

        // Si viene una sucursal nueva desde el formulario, crearla ahora
        if (payload.sucursal_nueva) {
          const nuevaSucursal = await entidadesService.sucursales.create({
            cliente: payload.cliente_id,
            poblacion: payload.sucursal_nueva.poblacion_id,
            codigo: payload.sucursal_nueva.codigo,
            condicion_pago: payload.sucursal_nueva.condicion_pago
          });
          payload.cliente_sucursal_id = nuevaSucursal.id;
          delete payload.sucursal_nueva;
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

  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

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
            onUpdated={handleFacturaUpdated}
            canEdit={isGerente()}
            canDelete={isGerente()}
            canViewPayments={isGerente() || isDistribuidor() || (isVendedor && isVendedor())}
            canEditEntrega={isGerente() || isDistribuidor()}
            loading={apiLoading}
          />
        );
      
      default:
        return (
          <div>
            {/* Toolbar: búsqueda fija + botón Filtros + acciones */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <div className="flex-grow-1" style={{ maxWidth: '620px' }}>
                  <SearchBar
                    placeholder="Buscar por número de factura o cliente..."
                    value={filters.search || ''}
                    onChange={(value) => {
                      const next = { ...filters, search: value };
                      // Asegurar que no enviemos accidentalmente filtros incompatibles
                      delete next.numero_factura;
                      delete next.cliente;
                      applyFilters(next);
                    }}
                  />
                </div>
                <button
                  className={`btn btn-outline-secondary ${showFiltersPanel ? 'active' : ''}`}
                  onClick={() => setShowFiltersPanel((v) => !v)}
                >
                  <i className="fas fa-filter me-1"></i>
                  Filtros
                </button>
                {Object.values(filters || {}).some(v => v !== '' && v !== null && v !== undefined) && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      clearFilters();
                      setShowFiltersPanel(false);
                    }}
                  >
                    <i className="fas fa-broom me-1"></i>
                    Limpiar filtros
                  </button>
                )}
              </div>
              <div className="d-flex gap-2">
                {isGerente() && (
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
              </div>
            </div>

            {/* Panel de filtros en Sidebar */}
            {showFiltersPanel && (
              <FiltersSidebar
                visible={true}
                onClose={() => setShowFiltersPanel(false)}
                filters={filters}
                setFilters={(updater) => {
                  const current = filters || {};
                  const next = typeof updater === 'function' ? updater(current) : updater;
                  applyFilters(next);
                }}
                filterConfig={[
                  { id: 'vendedor', label: 'Vendedor', type: 'select', options: [{ value: '', label: 'Todos los vendedores' }, ...((Array.isArray(entidades.vendedores) ? entidades.vendedores : []).map(v => ({ value: String(v.id ?? ''), label: v.usuario_nombre ?? v.usuario?.full_name ?? v.codigo ?? 'Vendedor' })))] },
                  { id: 'distribuidor', label: 'Distribuidor', type: 'select', options: [{ value: '', label: 'Todos los distribuidores' }, ...((Array.isArray(entidades.distribuidores) ? entidades.distribuidores : []).map(d => ({ value: String(d.id ?? ''), label: d.usuario_nombre ?? d.usuario?.full_name ?? d.codigo ?? 'Distribuidor' })))] },
                  { id: 'tipo', label: 'Tipo de factura', type: 'select', options: [
                    { value: '', label: 'Todos los tipos' },
                    { value: 'FE', label: 'Factura Electrónica (FE)' },
                    { value: 'R', label: 'Remisión (R)' },
                  ]},
                  { id: 'estado', label: 'Estado', type: 'select', options: [
                    { value: '', label: 'Todos los estados' },
                    { value: 'pendiente', label: 'Pendiente' },
                    { value: 'parcial', label: 'Pago Parcial' },
                    { value: 'pagada', label: 'Pagada' },
                    { value: 'vencida', label: 'Vencida' },
                    { value: 'cancelada', label: 'Cancelada' },
                  ]},
                  { id: 'fecha_desde', label: 'Fecha emisión desde', type: 'input', inputType: 'date' },
                  { id: 'fecha_hasta', label: 'Fecha emisión hasta', type: 'input', inputType: 'date' },
                  { id: 'fecha_venc_desde', label: 'Vencimiento desde', type: 'input', inputType: 'date' },
                  { id: 'fecha_venc_hasta', label: 'Vencimiento hasta', type: 'input', inputType: 'date' },
                  { id: 'valor_min', label: 'Valor mínimo', type: 'input', inputType: 'number', placeholder: '0' },
                  { id: 'valor_max', label: 'Valor máximo', type: 'input', inputType: 'number', placeholder: '999999' },
                  { id: 'saldo_pendiente', label: 'Saldo pendiente', type: 'select', options: [
                    { value: '', label: 'Todos' },
                    { value: 'con_saldo', label: 'Con saldo pendiente' },
                    { value: 'sin_saldo', label: 'Sin saldo pendiente' },
                  ]},
                ]}
                onApply={() => setShowFiltersPanel(false)}
              />
            )}

            {/* Tabla de facturas */}
            <FacturasTable
              facturas={(function(){
                // Filtros extra solo-frontend (por si backend no los aplica)
                let arr = Array.isArray(facturas) ? facturas : [];
                const toNumber = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
                const vmin = toNumber(filters.valor_min);
                const vmax = toNumber(filters.valor_max);
                const saldoMode = filters.saldo_pendiente;
                if (vmin !== null) arr = arr.filter(f => Number(f?.valor_total || f?.total || 0) >= vmin);
                if (vmax !== null) arr = arr.filter(f => Number(f?.valor_total || f?.total || 0) <= vmax);
                if (saldoMode === 'con_saldo') arr = arr.filter(f => Number(f?.saldo || f?.saldo_pendiente || 0) > 0);
                if (saldoMode === 'sin_saldo') arr = arr.filter(f => Number(f?.saldo || f?.saldo_pendiente || 0) === 0);
                return arr;
              })()}
              pagination={pagination}
              onViewDetail={(factura) => handleViewChange('detail', factura)}
              onEdit={handleEditFactura}
              onDelete={handleDeleteFactura}
              canEdit={isGerente()}
              canDelete={isGerente()}
              isDistribuidor={isDistribuidor()}
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