/**
 * Formulario para crear/editar facturas
 */
import React, { useState, useEffect } from 'react';
import { useToast } from '../../../components/Toast';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { DatePicker } from '../../../components/DatePicker';
import { Button } from '../../../components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { entidadesService } from '../../../services/entidadesService';

const FacturaForm = ({
  factura = null,
  entidades = {},
  onSave,
  onCancel,
  loading = false,
  errors = {}
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    numero_factura: '',
    cliente_id: '',
    vendedor_id: '',
    distribuidor_id: '',
    tipo: 'FE',
    fecha_emision: '',
    fecha_vencimiento: '',
    valor_total: '',
    observaciones: '',
  });
  
  // Sucursales del cliente seleccionado
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('');

  useEffect(() => {
    if (factura) {
      setFormData({
        numero_factura: factura.numero_factura || '',
        cliente_id: factura.cliente || factura.cliente?.id || '',
        vendedor_id: factura.vendedor || factura.vendedor?.id || '',
        distribuidor_id: factura.distribuidor || factura.distribuidor?.id || '',
        tipo: factura.tipo || 'FE',
        fecha_emision: factura.fecha_emision || '',
        fecha_vencimiento: factura.fecha_vencimiento || '',
        valor_total: factura.valor_total || '',
        observaciones: factura.observaciones || '',
      });
      // Preseleccionar sucursal si viene en la factura
      const csId = factura.cliente_sucursal?.id || factura.cliente_sucursal_id || '';
      setSucursalSeleccionada(csId ? String(csId) : '');
    } else {
  // Valores por defecto para nueva factura
      const hoy = new Date().toISOString().split('T')[0];
      const vencimiento = new Date();
      vencimiento.setDate(vencimiento.getDate() + 30);
      
      setFormData(prev => ({
        ...prev,
        fecha_emision: hoy,
        fecha_vencimiento: vencimiento.toISOString().split('T')[0]
      }));
    }
  }, [factura]);

  // Cargar sucursales cuando cambie el cliente seleccionado
  useEffect(() => {
    const loadSucursales = async (clienteId) => {
      try {
        const data = await entidadesService.sucursales.getByCliente(clienteId);
        const toArray = (d) => (Array.isArray(d) ? d : (d && Array.isArray(d.results) ? d.results : []));
        setSucursales(toArray(data));
      } catch (e) {
        setSucursales([]);
      }
    };
    if (formData.cliente_id) {
      loadSucursales(formData.cliente_id);
    } else {
      setSucursales([]);
      setSucursalSeleccionada('');
    }
  }, [formData.cliente_id]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.numero_factura || !formData.valor_total) {
      toast.warning('Por favor complete los campos requeridos');
      return;
    }
    // Validación de cliente: solo selección de existente
    if (!formData.cliente_id) {
      toast.warning('Seleccione un cliente');
      return;
    }
    // Validación de sucursal: debe seleccionar una existente
    if (!sucursalSeleccionada) {
      toast.warning('Seleccione una sucursal del cliente');
      return;
    }

    const toInt = (v) => (v === '' || v === null || v === undefined ? null : parseInt(v, 10));
    let dataToSubmit = {
      numero_factura: formData.numero_factura,
      cliente_id: toInt(formData.cliente_id),
      vendedor_id: toInt(formData.vendedor_id),
      distribuidor_id: toInt(formData.distribuidor_id),
      tipo: formData.tipo,
      fecha_emision: formData.fecha_emision,
      fecha_vencimiento: formData.fecha_vencimiento,
      valor_total: parseFloat(formData.valor_total),
      observaciones: formData.observaciones || ''
    };

    // Adjuntar sucursal seleccionada
    if (sucursalSeleccionada) {
      dataToSubmit.cliente_sucursal_id = toInt(sucursalSeleccionada);
    }

    onSave(dataToSubmit);
  };

  const asArray = (data) => (Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));

  const clientesOptions = [
    { value: '', label: 'Seleccionar cliente...' },
    ...asArray(entidades?.clientes).map(cliente => ({
      value: String(cliente.id),
      label: `${cliente.nombre} - ${cliente.telefono || 'Sin teléfono'}`
    }))
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando formulario..." />;
  }

  // Determinar población seleccionada (para mostrar asignación automática)
  const selectedPoblacionId = (() => {
    if (sucursalSeleccionada) {
      const suc = sucursales.find(s => String(s.id) === String(sucursalSeleccionada));
      return suc?.poblacion ? String(suc.poblacion) : '';
    }
    return '';
  })();

  const selectedPoblacion = asArray(entidades?.poblaciones).find(p => String(p.id) === String(selectedPoblacionId));
  const autoVendedorNombre = selectedPoblacion?.vendedor_nombre || 'Sin vendedor';
  const autoDistribuidorNombre = selectedPoblacion?.distribuidor_nombre || 'Sin distribuidor';

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      {/* Información básica */}
      <div className="col-12">
        <h5 className="border-bottom pb-2 mb-3">
          <i className="fas fa-file-invoice me-2"></i>
          Información de la Factura
        </h5>
      </div>

      <div className="col-md-6">
        <Input
          label="Número (solo dígitos) *"
          type="text"
          value={formData.numero_factura}
          onChange={(value) => {
            const onlyDigits = String(value || '').replace(/\D/g, '');
            handleInputChange('numero_factura', onlyDigits);
          }}
          error={errors.numero_factura}
          required
          disabled={loading}
        />
        <div className="form-text">
          Código resultante: <strong>{`${formData.tipo || 'FE'}-${String(formData.numero_factura || '').padStart(3, '0')}`}</strong>
        </div>
      </div>

      <div className="col-md-3">
        <DatePicker
          label="Fecha de Emisión *"
          value={formData.fecha_emision}
          onChange={(value) => handleInputChange('fecha_emision', value)}
          error={errors.fecha_emision}
          required
          disabled={loading}
        />
      </div>

      <div className="col-md-3">
        <DatePicker
          label="Fecha de Vencimiento *"
          value={formData.fecha_vencimiento}
          onChange={(value) => handleInputChange('fecha_vencimiento', value)}
          error={errors.fecha_vencimiento}
          required
          disabled={loading}
        />
      </div>

      {/* Cliente */}
      <div className="col-md-6">
        <Select
          label="Cliente *"
          value={formData.cliente_id}
          onChange={(value) => {
            handleInputChange('cliente_id', value);
          }}
          options={clientesOptions}
          placeholder={null}
          error={errors.cliente_id}
          required
          disabled={loading}
        />
      </div>
      {/* Sucursal del cliente */}
      {formData.cliente_id && (
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h6 className="card-title mb-3">
                <i className="fas fa-code-branch me-2"></i>
                Sucursal del Cliente
              </h6>
              <div className="row g-2">
                <div className="col-md-6">
                  <Select
                    label="Seleccionar sucursal"
                    value={sucursalSeleccionada || ''}
                    onChange={(value) => setSucursalSeleccionada(value)}
                    options={[
                      { value: '', label: 'Seleccionar sucursal...' },
                      ...sucursales.map(s => ({
                        value: String(s.id),
                        label: `${s.codigo} - ${s.poblacion_nombre || s.poblacion?.nombre || ''}`.trim()
                      }))
                    ]}
                    placeholder={null}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asignación automática por Población (informativo) */}
      <div className="col-md-6">
        <div className="card border-0 bg-light h-100">
          <div className="card-body py-2">
            <div className="d-flex align-items-center mb-1">
              <i className="fas fa-user-check me-2 text-muted"></i>
              <small className="text-muted">Asignación automática por Población</small>
            </div>
            <div className="row g-2">
              <div className="col-md-6">
                <div className="form-text mb-0"><strong>Vendedor:</strong> {autoVendedorNombre}</div>
              </div>
              <div className="col-md-6">
                <div className="form-text mb-0"><strong>Distribuidor:</strong> {autoDistribuidorNombre}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selección de tipo de factura */}
      <div className="col-md-3">
        <Select
          label="Tipo *"
          value={formData.tipo}
          onChange={(value) => handleInputChange('tipo', value)}
          options={[
            { value: 'FE', label: 'Factura electrónica (FE)' },
            { value: 'R', label: 'Remisión (R)' }
          ]}
          placeholder={null}
          required
          disabled={loading}
        />
      </div>

      {/* Valor total */}
      <div className="col-md-6">
        <Input
          label="Valor Total *"
          type="number"
          value={formData.valor_total}
          onChange={(value) => handleInputChange('valor_total', value)}
          min="0.01"
          step="0.01"
          error={errors.valor_total}
          required
          disabled={loading}
        />
      </div>

      <div className="col-12">
        <Input
          label="Observaciones"
          type="textarea"
          value={formData.observaciones}
          onChange={(value) => handleInputChange('observaciones', value)}
          rows="3"
          placeholder="Observaciones adicionales sobre la factura..."
          disabled={loading}
        />
      </div>

      {/* Botones */}
      <div className="col-12 d-flex justify-content-end gap-2 mt-4">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
        >
          {factura ? 'Actualizar' : 'Crear'} Factura
        </Button>
      </div>
    </form>
  );
};

export default FacturaForm;