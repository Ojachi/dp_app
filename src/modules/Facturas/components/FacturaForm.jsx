/**
 * Formulario para crear/editar facturas
 */
import React, { useState, useEffect } from 'react';
import { Input } from '../../../components/Input';
import { Select } from '../../../components/Select';
import { DatePicker } from '../../../components/DatePicker';
import { Button } from '../../../components/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { formatCurrency } from '../../../utils/formatters';

const FacturaForm = ({
  factura = null,
  entidades = {},
  onSubmit,
  onCancel,
  loading = false,
  errors = {}
}) => {
  const [formData, setFormData] = useState({
    numero_factura: '',
    cliente_id: '',
    vendedor_id: '',
    distribuidor_id: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    valor_total: '',
    observaciones: '',
    productos: []
  });

  const [producto, setProducto] = useState({
    nombre: '',
    cantidad: 1,
    valor_unitario: '',
    valor_total: 0
  });

  const [clienteNuevo, setClienteNuevo] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    email: ''
  });

  const [mostrarClienteForm, setMostrarClienteForm] = useState(false);
  const [calculoAutomatico, setCalculoAutomatico] = useState(true);

  useEffect(() => {
    if (factura) {
      setFormData({
        numero_factura: factura.numero_factura || '',
        cliente_id: factura.cliente_id || '',
        vendedor_id: factura.vendedor_id || '',
        distribuidor_id: factura.distribuidor_id || '',
        fecha_emision: factura.fecha_emision || '',
        fecha_vencimiento: factura.fecha_vencimiento || '',
        valor_total: factura.valor_total || '',
        observaciones: factura.observaciones || '',
        productos: factura.productos || []
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

  const handleProductoChange = (name, value) => {
    const updatedProducto = {
      ...producto,
      [name]: value
    };

    // Calcular valor total del producto automáticamente
    if (name === 'cantidad' || name === 'valor_unitario') {
      const cantidad = name === 'cantidad' ? parseFloat(value) || 0 : parseFloat(producto.cantidad) || 0;
      const valorUnitario = name === 'valor_unitario' ? parseFloat(value) || 0 : parseFloat(producto.valor_unitario) || 0;
      updatedProducto.valor_total = cantidad * valorUnitario;
    }

    setProducto(updatedProducto);
  };

  const agregarProducto = () => {
    if (!producto.nombre || !producto.cantidad || !producto.valor_unitario) {
      alert('Por favor complete todos los campos del producto');
      return;
    }

    const nuevoProducto = {
      ...producto,
      id: Date.now() // ID temporal para el frontend
    };

    const productosActualizados = [...formData.productos, nuevoProducto];
    setFormData(prev => ({
      ...prev,
      productos: productosActualizados
    }));

    // Calcular valor total automáticamente
    if (calculoAutomatico) {
      const valorTotal = productosActualizados.reduce((sum, p) => sum + p.valor_total, 0);
      setFormData(prev => ({
        ...prev,
        valor_total: valorTotal
      }));
    }

    // Limpiar formulario de producto
    setProducto({
      nombre: '',
      cantidad: 1,
      valor_unitario: '',
      valor_total: 0
    });
  };

  const eliminarProducto = (productoId) => {
    const productosActualizados = formData.productos.filter(p => p.id !== productoId);
    setFormData(prev => ({
      ...prev,
      productos: productosActualizados
    }));

    // Recalcular valor total
    if (calculoAutomatico) {
      const valorTotal = productosActualizados.reduce((sum, p) => sum + p.valor_total, 0);
      setFormData(prev => ({
        ...prev,
        valor_total: valorTotal
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.numero_factura || !formData.cliente_id || !formData.valor_total) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    const dataToSubmit = {
      ...formData,
      valor_total: parseFloat(formData.valor_total)
    };

    // Si se está creando un cliente nuevo
    if (mostrarClienteForm && clienteNuevo.nombre) {
      dataToSubmit.cliente_nuevo = clienteNuevo;
      dataToSubmit.cliente_id = null;
    }

    onSubmit(dataToSubmit);
  };

  const clientesOptions = [
    { value: '', label: 'Seleccionar cliente...' },
    { value: 'nuevo', label: '+ Crear nuevo cliente' },
    ...(entidades?.clientes || []).map(cliente => ({
      value: cliente.id,
      label: `${cliente.nombre} - ${cliente.telefono || 'Sin teléfono'}`
    }))
  ];

  const vendedoresOptions = [
    { value: '', label: 'Seleccionar vendedor...' },
    ...(entidades?.vendedores || []).map(vendedor => ({
      value: vendedor.id,
      label: vendedor.nombre
    }))
  ];

  const distribuidoresOptions = [
    { value: '', label: 'Seleccionar distribuidor...' },
    ...(entidades?.distribuidores || []).map(distribuidor => ({
      value: distribuidor.id,
      label: distribuidor.nombre
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
          error={errors.distribuidor_id}
          disabled={loading}
        />
      </div>

      {/* Productos */}
      <div className="col-12 mt-4">
        <h5 className="border-bottom pb-2 mb-3">
          <i className="fas fa-boxes me-2"></i>
          Productos/Servicios
        </h5>
      </div>

      {/* Formulario para agregar producto */}
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h6 className="card-title">Agregar Producto/Servicio</h6>
            <div className="row g-2">
              <div className="col-md-4">
                <Input
                  label="Nombre del producto"
                  type="text"
                  value={producto.nombre}
                  onChange={(value) => handleProductoChange('nombre', value)}
                  placeholder="Ej: Producto ABC"
                  disabled={loading}
                />
              </div>
              <div className="col-md-2">
                <Input
                  label="Cantidad"
                  type="number"
                  value={producto.cantidad}
                  onChange={(value) => handleProductoChange('cantidad', value)}
                  min="0.01"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div className="col-md-2">
                <Input
                  label="Valor Unitario"
                  type="number"
                  value={producto.valor_unitario}
                  onChange={(value) => handleProductoChange('valor_unitario', value)}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Valor Total</label>
                <div className="form-control bg-light">
                  {formatCurrency(producto.valor_total)}
                </div>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={agregarProducto}
                  disabled={loading}
                  className="w-100"
                >
                  <i className="fas fa-plus me-1"></i>
                  Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos agregados */}
      {formData.productos.length > 0 && (
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-sm">
              <thead className="bg-light">
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Valor Unitario</th>
                  <th>Valor Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formData.productos.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.nombre}</td>
                    <td>{prod.cantidad}</td>
                    <td>{formatCurrency(prod.valor_unitario)}</td>
                    <td>{formatCurrency(prod.valor_total)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => eliminarProducto(prod.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Valor total */}
      <div className="col-md-6">
        <div className="d-flex align-items-center mb-2">
          <Input
            label="Valor Total *"
            type="number"
            value={formData.valor_total}
            onChange={(value) => handleInputChange('valor_total', value)}
            min="0.01"
            step="0.01"
            error={errors.valor_total}
            required
            disabled={loading || calculoAutomatico}
          />
          <div className="form-check ms-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="calculoAutomatico"
              checked={calculoAutomatico}
              onChange={(e) => setCalculoAutomatico(e.target.checked)}
              disabled={loading}
            />
            <label className="form-check-label" htmlFor="calculoAutomatico">
              Cálculo automático
            </label>
          </div>
        </div>
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