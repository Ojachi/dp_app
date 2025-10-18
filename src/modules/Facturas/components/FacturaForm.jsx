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
    productos: []
  });
  
  // Productos/Servicios ya no se manejan en este MVP

  const [clienteNuevo, setClienteNuevo] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    email: ''
  });

  const [mostrarClienteForm, setMostrarClienteForm] = useState(false);
  // Cálculo automático eliminado: valor_total lo ingresa el usuario

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
        productos: [] 
      });
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
    // Validación de cliente: permitir cliente nuevo
    if (!mostrarClienteForm && !formData.cliente_id) {
      toast.warning('Seleccione un cliente o cree uno nuevo');
      return;
    }
    if (mostrarClienteForm && !clienteNuevo.nombre) {
      toast.warning('Ingrese el nombre del nuevo cliente');
      return;
    }

    const toInt = (v) => (v === '' || v === null || v === undefined ? null : parseInt(v, 10));
    const dataToSubmit = {
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

    // Adjuntar datos de nuevo cliente si aplica
    if (mostrarClienteForm) {
      dataToSubmit.cliente_nuevo = clienteNuevo;
      dataToSubmit.cliente_id = null;
    }

    onSave(dataToSubmit);
  };

  const asArray = (data) => (Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []));

  const clientesOptions = [
    { value: '', label: 'Seleccionar cliente...' },
    { value: 'nuevo', label: '+ Crear nuevo cliente' },
    ...asArray(entidades?.clientes).map(cliente => ({
      value: String(cliente.id),
      label: `${cliente.nombre} - ${cliente.telefono || 'Sin teléfono'}`
    }))
  ];

  const vendedoresOptions = [
    { value: '', label: 'Seleccionar vendedor...' },
    ...asArray(entidades?.vendedores).map(vendedor => ({
      value: String(vendedor.usuario?.id ?? vendedor.id),
      label: vendedor.usuario?.full_name ?? vendedor.nombre ?? vendedor.usuario_nombre ?? 'Vendedor'
    }))
  ];

  const distribuidoresOptions = [
    { value: '', label: 'Seleccionar distribuidor...' },
    ...asArray(entidades?.distribuidores).map(distribuidor => ({
      value: String(distribuidor.usuario?.id ?? distribuidor.id),
      label: distribuidor.usuario?.full_name ?? distribuidor.nombre ?? distribuidor.usuario_nombre ?? 'Distribuidor'
    }))
  ];

  if (loading) {
    return <LoadingSpinner message="Cargando formulario..." />;
  }

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
          label="Número de Factura *"
          type="text"
          value={formData.numero_factura}
          onChange={(value) => handleInputChange('numero_factura', value)}
          error={errors.numero_factura}
          required
          disabled={loading}
        />
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
          value={mostrarClienteForm ? 'nuevo' : formData.cliente_id}
          onChange={(value) => {
            if (value === 'nuevo') {
              setMostrarClienteForm(true);
              handleInputChange('cliente_id', '');
            } else {
              setMostrarClienteForm(false);
              handleInputChange('cliente_id', value);
            }
          }}
          options={clientesOptions}
          placeholder={null}
          error={errors.cliente_id}
          required
          disabled={loading}
        />
      </div>

      {/* Formulario de cliente nuevo */}
      {mostrarClienteForm && (
        <>
          <div className="col-12">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="fas fa-user-plus me-2"></i>
                  Datos del Nuevo Cliente
                </h6>
                <div className="row g-2">
                  <div className="col-md-6">
                    <Input
                      label="Nombre *"
                      type="text"
                      value={clienteNuevo.nombre}
                      onChange={(value) => setClienteNuevo(prev => ({ ...prev, nombre: value }))}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      label="Teléfono"
                      type="tel"
                      value={clienteNuevo.telefono}
                      onChange={(value) => setClienteNuevo(prev => ({ ...prev, telefono: value }))}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-md-3">
                    <Input
                      label="Email"
                      type="email"
                      value={clienteNuevo.email}
                      onChange={(value) => setClienteNuevo(prev => ({ ...prev, email: value }))}
                      disabled={loading}
                    />
                  </div>
                  <div className="col-12">
                    <Input
                      label="Dirección"
                      type="text"
                      value={clienteNuevo.direccion}
                      onChange={(value) => setClienteNuevo(prev => ({ ...prev, direccion: value }))}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="col-md-3">
        <Select
          label="Vendedor"
          value={formData.vendedor_id}
          onChange={(value) => handleInputChange('vendedor_id', value)}
          options={vendedoresOptions}
          placeholder={null}
          error={errors.vendedor_id}
          disabled={loading}
        />
      </div>

      <div className="col-md-3">
        <Select
          label="Distribuidor"
          value={formData.distribuidor_id}
          onChange={(value) => handleInputChange('distribuidor_id', value)}
          options={distribuidoresOptions}
          placeholder={null}
          error={errors.distribuidor_id}
          disabled={loading}
        />
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