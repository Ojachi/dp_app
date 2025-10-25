/**
 * Vista principal del módulo de Pagos
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pagosService } from '../../services/pagosService';
import PagosTable from './components/PagosTable';
import PagoForm from './components/PagoForm';
import PagoDetalleModal from './components/PagoDetalleModal';
import Modal from '../../components/Modal';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import SearchBar from '../../components/SearchBar';
import FiltersSidebar from '../../components/FiltersSidebar';

const PagosView = () => {
  const { hasRole } = useAuth();
  const { toast } = useToast();
  // Vista única (sin pestañas)
  const initialFilters = useMemo(() => ({
    search: '',
    tipo_pago: '',
    fecha_desde: '',
    fecha_hasta: '',
    factura_id: '',
    monto_min: '',
    monto_max: ''
  }), []);
  const [pagos, setPagos] = useState([]);
  // MVP: sin estado de dashboard
  const [loading, setLoading] = useState(false);
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [editingPago, setEditingPago] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [detallePago, setDetallePago] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  // Métodos de pago fijos: efectivo y consignación
  const metodosPago = useMemo(() => ([
    { value: '', label: 'Todos los métodos' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'consignacion', label: 'Consignación' },
  ]), []);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Cargar datos del dashboard
  // MVP: se omite carga de dashboard
  const loadDashboardData = useCallback(async () => {}, []);

  // Ya no se cargan dinámicamente; se usan opciones fijas

  // Cargar pagos
  const loadPagos = useCallback(async (page = 1) => {
    try {
      const serverFilters = {
        search: filters.search,
        tipo_pago: filters.tipo_pago,
        fecha_desde: filters.fecha_desde,
        fecha_hasta: filters.fecha_hasta,
        factura_id: filters.factura_id,
      };

      const response = await pagosService.getPagos({
        ...serverFilters,
        page: page,
        page_size: pagination.itemsPerPage
      });

      const data = Array.isArray(response?.results)
        ? response.results
        : Array.isArray(response)
          ? response
          : [];

      // Filtros sólo-frontend: monto_min / monto_max (+ fallback de búsqueda)
      const filtered = data.filter((p) => {
        let ok = true;
        const monto = Number(p?.monto_total || p?.monto || 0);
        if (filters.monto_min !== '' && !isNaN(filters.monto_min)) ok = ok && monto >= Number(filters.monto_min);
        if (filters.monto_max !== '' && !isNaN(filters.monto_max)) ok = ok && monto <= Number(filters.monto_max);
        if (filters.search) {
          const s = String(filters.search).toLowerCase();
          const hay = [p?.codigo, p?.numero_pago, p?.factura_numero, p?.cliente_nombre, p?.cliente?.nombre]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(s));
          ok = ok && hay;
        }
        return ok;
      });

      setPagos(filtered);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalItems: filtered.length,
        totalPages: Math.max(1, Math.ceil((filtered.length || 0) / pagination.itemsPerPage))
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
  }, [filters, loadPagos]);

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
      
      // Recargar listado
      loadPagos(pagination.currentPage);

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

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header (limpio, sin botón duplicado) */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="fas fa-money-bill-wave me-2"></i>
              Gestión de Pagos
            </h2>
            <div className="d-flex gap-2"></div>
          </div>

          {/* Toolbar: búsqueda visible + botón Filtros + acciones */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2 flex-grow-1">
              <div className="flex-grow-1" style={{ maxWidth: '620px' }}>
                <SearchBar
                  placeholder="Buscar por número de pago, factura, cliente..."
                  value={filters.search}
                  onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                />
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => setShowFiltersPanel((v) => !v)}
                className={showFiltersPanel ? 'active' : ''}
              >
                <i className="fas fa-filter me-1"></i>
                Filtros
              </Button>
              {Object.values(filters || {}).some(v => v !== '' && v !== null && v !== undefined) && (
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setFilters(initialFilters);
                    setShowFiltersPanel(false);
                  }}
                >
                  <i className="fas fa-broom me-1"></i>
                  Limpiar filtros
                </Button>
              )}
            </div>
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
            </div>
          </div>

          {/* Panel de filtros en Sidebar (similar a Cartera) */}
          {showFiltersPanel && (
            <FiltersSidebar
              visible={true}
              onClose={() => setShowFiltersPanel(false)}
              filters={filters}
              setFilters={(updater) => setFilters(prev => (typeof updater === 'function' ? updater(prev) : updater))}
              filterConfig={[
                { id: 'tipo_pago', label: 'Tipo de pago', type: 'select', options: metodosPago },
                { id: 'fecha_desde', label: 'Fecha desde', type: 'input', inputType: 'date' },
                { id: 'fecha_hasta', label: 'Fecha hasta', type: 'input', inputType: 'date' },
                { id: 'factura_id', label: 'ID de factura', type: 'input', inputType: 'number' },
                { id: 'monto_min', label: 'Monto mínimo', type: 'input', inputType: 'number', placeholder: '0' },
                { id: 'monto_max', label: 'Monto máximo', type: 'input', inputType: 'number', placeholder: '999999' },
              ]}
              onApply={() => {
                handleFiltersChange(filters);
                setShowFiltersPanel(false);
              }}
            />
          )}

          {/* Tabla de resultados */}
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
