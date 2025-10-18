/**
 * Vista principal del módulo de Pagos
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pagosService } from '../../services/pagosService';
import PagosTable from './components/PagosTable';
import PagoForm from './components/PagoForm';
import PagosFilters from './components/PagosFilters';
// MVP: dashboard de pagos oculto
// import PagosDashboard from './components/PagosDashboard';
import PagoDetalleModal from './components/PagoDetalleModal';
import Modal from '../../components/Modal';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';

const PagosView = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  // MVP: solo listado visible
  const [activeTab, setActiveTab] = useState('listado');
  const [pagos, setPagos] = useState([]);
  // MVP: sin estado de dashboard
  const [loading, setLoading] = useState(false);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detallePago, setDetallePago] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Cargar datos del dashboard
  // MVP: se omite carga de dashboard
  const loadDashboardData = useCallback(async () => {}, []);

  // Cargar pagos
  const loadPagos = useCallback(async (page = 1) => {
    try {
      const response = await pagosService.getPagos({
        ...filters,
        page: page,
        page_size: pagination.itemsPerPage
      });

      const data = Array.isArray(response?.results)
        ? response.results
        : Array.isArray(response)
          ? response
          : [];

      setPagos(data);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalItems: response.count || data.length || 0,
        totalPages: Math.max(1, Math.ceil((response.count || data.length || 0) / pagination.itemsPerPage))
      }));
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      setPagos([]);
    }
  }, [filters, pagination.itemsPerPage]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await loadPagos();
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeTab, filters, loadDashboardData, loadPagos]);

  // Manejar creación/actualización de pago
  const handlePagoSubmit = async (pagoData) => {
    try {
      if (editingPago) {
        if (pagoData && pagoData.__action__ === 'confirmed') {
          // Confirmación ya realizada desde el formulario
        } else {
          await pagosService.updatePago(editingPago.id, pagoData);
        }
      } else {
        await pagosService.createPago(pagoData);
      }

      setShowPagoForm(false);
      setEditingPago(null);
      setFormLoading(false);
      
      // Recargar datos
      loadDashboardData();
      if (activeTab === 'listado') {
        loadPagos(pagination.currentPage);
      }

      // Notificación de éxito
      let message = 'Pago registrado correctamente';
      if (editingPago) message = 'Pago actualizado correctamente';
      if (pagoData && pagoData.__action__ === 'confirmed') message = 'Pago confirmado correctamente';
      toast.success(message);
    } catch (error) {
      console.error('Error al guardar pago:', error);
      toast.error('Error al guardar el pago: ' + (error.message || 'Ocurrió un error'));
    }
  };

  // Manejar eliminación de pago
  const handleDeletePago = async (pagoId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este pago?')) {
      return;
    }

    try {
      await pagosService.deletePago(pagoId);
      loadPagos(pagination.currentPage);
      loadDashboardData();
      toast.success('Pago eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      toast.error('Error al eliminar el pago: ' + (error.message || 'Ocurrió un error'));
    }
  };

  // Manejar edición de pago
  const handleEditPago = async (pago) => {
    setFormLoading(true);
    setShowPagoForm(true);
    try {
      const detalle = await pagosService.getPagoById(pago.id);
      setEditingPago(detalle);
    } catch (error) {
      console.error('Error al obtener pago para edición:', error);
      toast.error('No fue posible cargar la información del pago.');
      setShowPagoForm(false);
      setEditingPago(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewPago = async (pagoId) => {
    try {
      setDetalleLoading(true);
      const detalle = await pagosService.getPagoById(pagoId);
      setDetallePago(detalle);
      setShowDetalleModal(true);
    } catch (error) {
      console.error('Error al obtener pago:', error);
      toast.error('No fue posible cargar el detalle del pago.');
    } finally {
      setDetalleLoading(false);
    }
  };

  // Aplicar filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });
  };

  // Exportar reporte
  // const handleExportReport = async (formato) => {
  //   try {
  //     await pagosService.exportarReporte(filters, formato);
  //     toast.success('Exportación iniciada');
  //   } catch (error) {
  //     console.error('Error al exportar reporte:', error);
  //     toast.error('Error al exportar el reporte: ' + (error.message || 'Ocurrió un error'));
  //   }
  // };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-money-bill-wave me-2"></i>
              Gestión de Pagos
            </h2>
            <div className="d-flex gap-2">
              {hasRole(['gerente', 'vendedor', 'distribuidor']) && (
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingPago(null);
                    setFormLoading(false);
                    setShowPagoForm(true);
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Registrar Pago
                </Button>
              )}
              {/* <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-download me-2"></i>
                  Exportar
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => handleExportReport('excel')}
                    >
                      <i className="fas fa-file-excel me-2"></i>
                      Excel
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => handleExportReport('pdf')}
                    >
                      <i className="fas fa-file-pdf me-2"></i>
                      PDF
                    </button>
                  </li>
                </ul>
              </div> */}
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="card">
            <div className="card-header border-0">
              <ul className="nav nav-tabs card-header-tabs">
                {/* MVP: pestaña de dashboard oculta */}
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'listado' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listado')}
                  >
                    <i className="fas fa-list me-2"></i>
                    Listado de Pagos
                  </button>
                </li>
                {/* MVP: se elimina la pestaña de Facturas Pendientes en Pagos */}
              </ul>
            </div>

            <div className="card-body p-0">
              {/* Dashboard Tab */}
              {/* MVP: no dashboard */}

              {/* Listado Tab */}
              {activeTab === 'listado' && (
                <div>
                  <PagosFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onReset={() => setFilters({})}
                  />
                  <PagosTable
                    pagos={pagos}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={loadPagos}
                    onView={handleViewPago}
                    onEdit={hasRole('gerente') ? handleEditPago : null}
                    onDelete={hasRole('gerente') ? handleDeletePago : null}
                  />
                </div>
              )}

              {/* MVP: sin pestaña de Facturas Pendientes */}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de formulario de pago */}
      <Modal
        show={showPagoForm}
        onHide={() => {
          setShowPagoForm(false);
          setEditingPago(null);
          setFormLoading(false);
        }}
        title={editingPago ? 'Editar Pago' : 'Registrar Nuevo Pago'}
        size="lg"
      >
        <PagoForm
          pago={editingPago}
          onSubmit={handlePagoSubmit}
          onCancel={() => {
            setShowPagoForm(false);
            setEditingPago(null);
            setFormLoading(false);
          }}
          initialLoading={formLoading}
        />
      </Modal>

      <PagoDetalleModal
        pago={detallePago}
        show={showDetalleModal}
        loading={detalleLoading}
        onHide={() => {
          setShowDetalleModal(false);
          setDetallePago(null);
        }}
      />
    </div>
  );
};

export default PagosView;
