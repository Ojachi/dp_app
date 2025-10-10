/**
 * Formulario para crear/editar pagos
 */
import React, { useState, useEffect } from 'react';
import { pagosService } from '../../../services/pagosService';
import { Button } from '../../../components/Button';

const PagoForm = ({ pago, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    factura: '',
    monto: '',
    metodo_pago: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    referencia: '',
    observaciones: '',
    estado: 'completado'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);

  useEffect(() => {
    loadInitialData();
    
    if (pago) {
      setFormData({
        factura: pago.factura?.id || '',
        monto: pago.monto || '',
        metodo_pago: pago.metodo_pago || '',
        fecha_pago: pago.fecha_pago?.split('T')[0] || '',
        referencia: pago.referencia || '',
        observaciones: pago.observaciones || '',
        estado: pago.estado || 'completado'
      });
    }
  }, [pago]);

  const loadInitialData = async () => {
    try {
      const [metodos, facturas] = await Promise.all([
        pagosService.getMetodosPago(),
        pagosService.getFacturasPendientes()
      ]);

      setMetodosPago(metodos);
      setFacturasPendientes(facturas.results || []);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Manejar selección de factura
    if (name === 'factura') {
      const factura = facturasPendientes.find(f => f.id.toString() === value);
      setFacturaSeleccionada(factura);
      
      // Sugerir monto basado en saldo pendiente
      if (factura && !formData.monto) {
        setFormData(prev => ({
          ...prev,
          monto: factura.saldo_pendiente
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.factura) {
      newErrors.factura = 'Debe seleccionar una factura';
    }

    if (!formData.monto) {
      newErrors.monto = 'El monto es requerido';
    } else if (parseFloat(formData.monto) <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    } else if (facturaSeleccionada && parseFloat(formData.monto) > facturaSeleccionada.saldo_pendiente) {
      newErrors.monto = 'El monto no puede ser mayor al saldo pendiente';
    }

    if (!formData.metodo_pago) {
      newErrors.metodo_pago = 'Debe seleccionar un método de pago';
    }

    if (!formData.fecha_pago) {
      newErrors.fecha_pago = 'La fecha de pago es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        monto: parseFloat(formData.monto)
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Selección de factura */}
        <div className="col-12">
          <label className="form-label">
            Factura <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.factura ? 'is-invalid' : ''}`}
            name="factura"
            value={formData.factura}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">Seleccionar factura...</option>
            {facturasPendientes.map(factura => (
              <option key={factura.id} value={factura.id}>
                {factura.numero} - {factura.cliente.nombre} - 
                Pendiente: {formatCurrency(factura.saldo_pendiente)}
              </option>
            ))}
          </select>
          {errors.factura && (
            <div className="invalid-feedback">{errors.factura}</div>
          )}
          {facturaSeleccionada && (
            <div className="mt-2 p-2 bg-light rounded">
              <small>
                <strong>Cliente:</strong> {facturaSeleccionada.cliente.nombre}<br />
                <strong>Total factura:</strong> {formatCurrency(facturaSeleccionada.total)}<br />
                <strong>Saldo pendiente:</strong> {formatCurrency(facturaSeleccionada.saldo_pendiente)}<br />
                <strong>Vence:</strong> {new Date(facturaSeleccionada.fecha_vencimiento).toLocaleDateString('es-CO')}
              </small>
            </div>
          )}
        </div>

        {/* Monto */}
        <div className="col-md-6">
          <label className="form-label">
            Monto <span className="text-danger">*</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className={`form-control ${errors.monto ? 'is-invalid' : ''}`}
              name="monto"
              value={formData.monto}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              disabled={loading}
            />
            {errors.monto && (
              <div className="invalid-feedback">{errors.monto}</div>
            )}
          </div>
          {facturaSeleccionada && formData.monto && (
            <small className="text-muted">
              Saldo restante: {formatCurrency(facturaSeleccionada.saldo_pendiente - parseFloat(formData.monto || 0))}
            </small>
          )}
        </div>

        {/* Método de pago */}
        <div className="col-md-6">
          <label className="form-label">
            Método de Pago <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.metodo_pago ? 'is-invalid' : ''}`}
            name="metodo_pago"
            value={formData.metodo_pago}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="">Seleccionar método...</option>
            {metodosPago.map(metodo => (
              <option key={metodo.id} value={metodo.id}>
                {metodo.nombre}
              </option>
            ))}
          </select>
          {errors.metodo_pago && (
            <div className="invalid-feedback">{errors.metodo_pago}</div>
          )}
        </div>

        {/* Fecha de pago */}
        <div className="col-md-6">
          <label className="form-label">
            Fecha de Pago <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={`form-control ${errors.fecha_pago ? 'is-invalid' : ''}`}
            name="fecha_pago"
            value={formData.fecha_pago}
            onChange={handleInputChange}
            disabled={loading}
          />
          {errors.fecha_pago && (
            <div className="invalid-feedback">{errors.fecha_pago}</div>
          )}
        </div>

        {/* Estado */}
        <div className="col-md-6">
          <label className="form-label">Estado</label>
          <select
            className="form-select"
            name="estado"
            value={formData.estado}
            onChange={handleInputChange}
            disabled={loading}
          >
            <option value="completado">Completado</option>
            <option value="pendiente">Pendiente</option>
            <option value="procesando">Procesando</option>
          </select>
        </div>

        {/* Referencia */}
        <div className="col-12">
          <label className="form-label">Referencia/Número de Transacción</label>
          <input
            type="text"
            className="form-control"
            name="referencia"
            value={formData.referencia}
            onChange={handleInputChange}
            placeholder="Número de referencia, transacción o cheque"
            disabled={loading}
          />
        </div>

        {/* Observaciones */}
        <div className="col-12">
          <label className="form-label">Observaciones</label>
          <textarea
            className="form-control"
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            rows="3"
            placeholder="Observaciones adicionales sobre el pago"
            disabled={loading}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading && <span className="spinner-border spinner-border-sm me-2"></span>}
          {pago ? 'Actualizar' : 'Registrar'} Pago
        </Button>
      </div>
    </form>
  );
};

export default PagoForm;