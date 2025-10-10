/**
 * Vista principal del módulo de Pagos
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pagosService } from '../../services/pagosService';
import PagosTable from './components/PagosTable';
import PagoForm from './components/PagoForm';
import PagosFilters from './components/PagosFilters';
import PagosDashboard from './components/PagosDashboard';
import FacturasPendientes from './components/FacturasPendientes';
import Modal from '../../components/Modal';
import { Button } from '../../components/Button';

const PagosView = () => {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pagos, setPagos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Cargar datos del dashboard
  const loadDashboardData = useCallback(async () => {
    try {
      const data = await pagosService.getDashboard(filters);
      setDashboardData(data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    }
  }, [filters]);

  // Cargar pagos
  const loadPagos = useCallback(async (page = 1) => {
    try {
      const response = await pagosService.getPagos({
        ...filters,
        page: page,
        page_size: pagination.itemsPerPage
      });

      setPagos(response.results || []);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalItems: response.count || 0,
        totalPages: Math.ceil((response.count || 0) / pagination.itemsPerPage)
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
        await loadDashboardData();
        if (activeTab === 'listado') {
          await loadPagos();
        }
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
        await pagosService.updatePago(editingPago.id, pagoData);
      } else {
        await pagosService.createPago(pagoData);
      }

      setShowPagoForm(false);
      setEditingPago(null);
      
      // Recargar datos
      loadDashboardData();
      if (activeTab === 'listado') {
        loadPagos(pagination.currentPage);
      }

      // Mostrar mensaje de éxito (aquí podrías usar un toast)
      alert(editingPago ? 'Pago actualizado correctamente' : 'Pago registrado correctamente');
    } catch (error) {
      console.error('Error al guardar pago:', error);
      alert('Error al guardar el pago: ' + error.message);
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
      alert('Pago eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar pago:', error);
      alert('Error al eliminar el pago: ' + error.message);
    }
  };

  // Manejar edición de pago
  const handleEditPago = (pago) => {
    setEditingPago(pago);
    setShowPagoForm(true);
  };

  // Aplicar filtros
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });
  };

  // Exportar reporte
  const handleExportReport = async (formato) => {
    try {
      await pagosService.exportarReporte(filters, formato);
    } catch (error) {
      console.error('Error al exportar reporte:', error);
      alert('Error al exportar el reporte: ' + error.message);
    }
  };

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
              {hasRole('crear_pago') && (
                <Button
                  variant="primary"
                  onClick={() => setShowPagoForm(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Registrar Pago
                </Button>
              )}
              <div className="dropdown">
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
              </div>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="card">
            <div className="card-header border-0">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <i className="fas fa-chart-pie me-2"></i>
                    Dashboard
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'listado' ? 'active' : ''}`}
                    onClick={() => setActiveTab('listado')}
                  >
                    <i className="fas fa-list me-2"></i>
                    Listado de Pagos
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'pendientes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pendientes')}
                  >
                    <i className="fas fa-clock me-2"></i>
                    Facturas Pendientes
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body p-0">
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="p-4">
                  <PagosDashboard
                    data={dashboardData}
                    loading={loading}
                    onFiltersChange={handleFiltersChange}
                  />
                </div>
              )}

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
                    onEdit={hasRole('editar_pago') ? handleEditPago : null}
                    onDelete={hasRole('eliminar_pago') ? handleDeletePago : null}
                  />
                </div>
              )}

              {/* Pendientes Tab */}
              {activeTab === 'pendientes' && (
                <div className="p-4">
                  <FacturasPendientes />
                </div>
              )}
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
          }}
        />
      </Modal>
    </div>
  );
};

export default PagosView;
