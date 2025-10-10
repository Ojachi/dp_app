/**
 * Componente para mostrar facturas pendientes de pago
 */
import React, { useState, useEffect } from 'react';
import { pagosService } from '../../../services/pagosService';
import { Button } from '../../../components/Button';
import Modal from '../../../components/Modal';
import PagoForm from './PagoForm';

const FacturasPendientes = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    const loadFacturas = async (page = 1) => {
      try {
        setLoading(true);
        const response = await pagosService.getFacturasPendientes({
          ...filters,
          page,
          page_size: pagination.itemsPerPage
        });

        setFacturas(response.results || []);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalItems: response.count || 0,
          totalPages: Math.ceil((response.count || 0) / prev.itemsPerPage)
        }));
      } catch (error) {
        console.error('Error al cargar facturas pendientes:', error);
        setFacturas([]);
      } finally {
        setLoading(false);
      }
    };

    loadFacturas();
  }, [filters, pagination.itemsPerPage]);

  const loadFacturas = async (page = 1) => {
    try {
      setLoading(true);
      const response = await pagosService.getFacturasPendientes({
        ...filters,
        page,
        page_size: pagination.itemsPerPage
      });

      setFacturas(response.results || []);
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        totalItems: response.count || 0,
        totalPages: Math.ceil((response.count || 0) / prev.itemsPerPage)
      }));
    } catch (error) {
      console.error('Error al cargar facturas pendientes:', error);
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAplicarPago = (factura) => {
    setSelectedFactura(factura);
    setShowPagoModal(true);
  };

  const handlePagoSubmit = async (pagoData) => {
    try {
      await pagosService.aplicarPagoFactura(selectedFactura.id, pagoData);
      setShowPagoModal(false);
      setSelectedFactura(null);
      loadFacturas(pagination.currentPage);
      alert('Pago aplicado correctamente');
    } catch (error) {
      console.error('Error al aplicar pago:', error);
      alert('Error al aplicar el pago: ' + error.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const getDiasVencimiento = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
    return diferencia;
  };

  const getEstadoVencimiento = (diasVencimiento) => {
    if (diasVencimiento < 0) {
      return { clase: 'danger', texto: 'Vencida' };
    } else if (diasVencimiento <= 7) {
      return { clase: 'warning', texto: 'Por vencer' };
    } else {
      return { clase: 'success', texto: 'Al día' };
    }
  };

  if (loading && facturas.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-muted">Cargando facturas pendientes...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por cliente o número..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.estado_vencimiento || ''}
            onChange={(e) => setFilters({ ...filters, estado_vencimiento: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="vencida">Vencidas</option>
            <option value="por_vencer">Por vencer (7 días)</option>
            <option value="al_dia">Al día</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filters.order_by || ''}
            onChange={(e) => setFilters({ ...filters, order_by: e.target.value })}
          >
            <option value="">Ordenar por...</option>
            <option value="fecha_vencimiento">Fecha de vencimiento</option>
            <option value="saldo_pendiente">Saldo pendiente</option>
            <option value="cliente">Cliente</option>
          </select>
        </div>
        <div className="col-md-2">
          <Button
            variant="outline-secondary"
            onClick={() => setFilters({})}
            className="w-100"
          >
            <i className="fas fa-undo me-2"></i>
            Limpiar
          </Button>
        </div>
      </div>

      {/* Lista de facturas */}
      {facturas.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-file-invoice fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No hay facturas pendientes</h5>
          <p className="text-muted">
            Todas las facturas están al día con sus pagos.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {facturas.map(factura => {
            const diasVencimiento = getDiasVencimiento(factura.fecha_vencimiento);
            const estadoVencimiento = getEstadoVencimiento(diasVencimiento);

            return (
              <div key={factura.id} className="col-12">
                <div className={`card border-start border-${estadoVencimiento.clase} border-4`}>
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <h6 className="mb-1 fw-bold">{factura.numero}</h6>
                        <small className="text-muted">
                          {formatDate(factura.fecha_emision)}
                        </small>
                      </div>
                      
                      <div className="col-md-3">
                        <div className="fw-medium">{factura.cliente.nombre}</div>
                        <small className="text-muted">{factura.cliente.email}</small>
                      </div>
                      
                      <div className="col-md-2 text-center">
                        <div className="fw-bold text-dark">
                          {formatCurrency(factura.total)}
                        </div>
                        <small className="text-muted">Total</small>
                      </div>
                      
                      <div className="col-md-2 text-center">
                        <div className="fw-bold text-danger">
                          {formatCurrency(factura.saldo_pendiente)}
                        </div>
                        <small className="text-muted">Pendiente</small>
                      </div>
                      
                      <div className="col-md-2 text-center">
                        <div className={`badge bg-${estadoVencimiento.clase} mb-2`}>
                          {estadoVencimiento.texto}
                        </div>
                        <div className="small text-muted">
                          Vence: {formatDate(factura.fecha_vencimiento)}
                        </div>
                        {diasVencimiento !== 0 && (
                          <div className="small">
                            {diasVencimiento > 0 
                              ? `${diasVencimiento} días`
                              : `${Math.abs(diasVencimiento)} días vencida`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAplicarPago(factura)}
                            >
                              <i className="fas fa-money-bill me-2"></i>
                              Aplicar Pago
                            </Button>
                            <Button
                              variant="outline-info"
                              size="sm"
                              title="Ver detalle de factura"
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                          </div>
                          
                          <div className="text-end">
                            <small className="text-muted">
                              Pagado: {formatCurrency(factura.total - factura.saldo_pendiente)}
                            </small>
                            <div className="progress mt-1" style={{ width: '200px', height: '6px' }}>
                              <div 
                                className="progress-bar bg-success"
                                style={{ 
                                  width: `${((factura.total - factura.saldo_pendiente) / factura.total) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => loadFacturas(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Anterior
                </button>
              </li>
              
              {[...Array(pagination.totalPages)].map((_, index) => (
                <li 
                  key={index + 1}
                  className={`page-item ${pagination.currentPage === index + 1 ? 'active' : ''}`}
                >
                  <button 
                    className="page-link"
                    onClick={() => loadFacturas(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              
              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link"
                  onClick={() => loadFacturas(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Siguiente
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Modal para aplicar pago */}
      <Modal
        show={showPagoModal}
        onHide={() => {
          setShowPagoModal(false);
          setSelectedFactura(null);
        }}
        title={`Aplicar Pago - ${selectedFactura?.numero}`}
        size="lg"
      >
        {selectedFactura && (
          <PagoForm
            factura={selectedFactura}
            onSubmit={handlePagoSubmit}
            onCancel={() => {
              setShowPagoModal(false);
              setSelectedFactura(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default FacturasPendientes;