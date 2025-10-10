/**
 * AlertaForm - Formulario para crear/editar alertas
 */
import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';

const AlertaForm = ({ alerta, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    prioridad: 'media',
    tipo: 'sistema',
    usuario_destino: '',
    es_global: false,
    fecha_expiracion: '',
    requiere_confirmacion: false,
    url_accion: '',
    metadata: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos si es edición
  useEffect(() => {
    if (alerta) {
      setFormData({
        titulo: alerta.titulo || '',
        mensaje: alerta.mensaje || '',
        prioridad: alerta.prioridad || 'media',
        tipo: alerta.tipo || 'sistema',
        usuario_destino: alerta.usuario_destino || '',
        es_global: alerta.es_global || false,
        fecha_expiracion: alerta.fecha_expiracion ? 
          new Date(alerta.fecha_expiracion).toISOString().split('T')[0] : '',
        requiere_confirmacion: alerta.requiere_confirmacion || false,
        url_accion: alerta.url_accion || '',
        metadata: alerta.metadata ? JSON.stringify(alerta.metadata, null, 2) : ''
      });
    }
  }, [alerta]);

  // Opciones para los selectores
  const opcionesPrioridad = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' }
  ];

  const opcionesTipo = [
    { value: 'sistema', label: 'Sistema' },
    { value: 'factura', label: 'Factura' },
    { value: 'pago', label: 'Pago' },
    { value: 'cartera', label: 'Cartera' },
    { value: 'importacion', label: 'Importación' }
  ];

  // Manejo de cambios en el formulario
  const handleChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));

    // Limpiar error del campo
    if (errors[campo]) {
      setErrors(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.length > 200) {
      newErrors.titulo = 'El título no puede exceder 200 caracteres';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es obligatorio';
    } else if (formData.mensaje.length > 1000) {
      newErrors.mensaje = 'El mensaje no puede exceder 1000 caracteres';
    }

    if (!formData.prioridad) {
      newErrors.prioridad = 'La prioridad es obligatoria';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'El tipo es obligatorio';
    }

    if (formData.fecha_expiracion) {
      const fechaExp = new Date(formData.fecha_expiracion);
      const fechaActual = new Date();
      if (fechaExp < fechaActual) {
        newErrors.fecha_expiracion = 'La fecha de expiración debe ser futura';
      }
    }

    if (formData.url_accion && !isValidUrl(formData.url_accion)) {
      newErrors.url_accion = 'La URL no es válida';
    }

    if (formData.metadata) {
      try {
        JSON.parse(formData.metadata);
      } catch (e) {
        newErrors.metadata = 'El metadata debe ser un JSON válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const dataToSubmit = {
        ...formData,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : null
      };

      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setErrors({
        submit: 'Error al guardar la alerta. Por favor, intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Título */}
        <div className="col-12">
          <Input
            label="Título *"
            value={formData.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            placeholder="Título de la alerta"
            error={errors.titulo}
            maxLength={200}
            required
          />
        </div>

        {/* Mensaje */}
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">Mensaje *</label>
            <textarea
              className={`form-control ${errors.mensaje ? 'is-invalid' : ''}`}
              rows="4"
              value={formData.mensaje}
              onChange={(e) => handleChange('mensaje', e.target.value)}
              placeholder="Mensaje detallado de la alerta"
              maxLength={1000}
              required
            />
            {errors.mensaje && (
              <div className="invalid-feedback">{errors.mensaje}</div>
            )}
            <div className="form-text">
              {formData.mensaje.length}/1000 caracteres
            </div>
          </div>
        </div>

        {/* Prioridad y Tipo */}
        <div className="col-md-6">
          <Select
            label="Prioridad *"
            value={formData.prioridad}
            onChange={(e) => handleChange('prioridad', e.target.value)}
            options={opcionesPrioridad}
            error={errors.prioridad}
            required
          />
        </div>

        <div className="col-md-6">
          <Select
            label="Tipo *"
            value={formData.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            options={opcionesTipo}
            error={errors.tipo}
            required
          />
        </div>

        {/* Usuario destino */}
        <div className="col-md-6">
          <Input
            label="Usuario Destino"
            value={formData.usuario_destino}
            onChange={(e) => handleChange('usuario_destino', e.target.value)}
            placeholder="ID del usuario (opcional)"
            error={errors.usuario_destino}
            helperText="Dejar vacío para alerta general"
          />
        </div>

        {/* Fecha de expiración */}
        <div className="col-md-6">
          <Input
            type="date"
            label="Fecha de Expiración"
            value={formData.fecha_expiracion}
            onChange={(e) => handleChange('fecha_expiracion', e.target.value)}
            error={errors.fecha_expiracion}
            helperText="Opcional - La alerta se ocultará después de esta fecha"
          />
        </div>

        {/* URL de acción */}
        <div className="col-12">
          <Input
            label="URL de Acción"
            value={formData.url_accion}
            onChange={(e) => handleChange('url_accion', e.target.value)}
            placeholder="https://ejemplo.com/accion (opcional)"
            error={errors.url_accion}
            helperText="URL a la que redirigir cuando se haga clic en la alerta"
          />
        </div>

        {/* Checkboxes */}
        <div className="col-12">
          <div className="row">
            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="es_global"
                  checked={formData.es_global}
                  onChange={(e) => handleChange('es_global', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="es_global">
                  Alerta global (visible para todos los usuarios)
                </label>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="requiere_confirmacion"
                  checked={formData.requiere_confirmacion}
                  onChange={(e) => handleChange('requiere_confirmacion', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="requiere_confirmacion">
                  Requiere confirmación del usuario
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata (JSON) */}
        <div className="col-12">
          <div className="mb-3">
            <label className="form-label">Metadata (JSON)</label>
            <textarea
              className={`form-control ${errors.metadata ? 'is-invalid' : ''}`}
              rows="3"
              value={formData.metadata}
              onChange={(e) => handleChange('metadata', e.target.value)}
              placeholder='{"clave": "valor"}'
              style={{ fontFamily: 'monospace' }}
            />
            {errors.metadata && (
              <div className="invalid-feedback">{errors.metadata}</div>
            )}
            <div className="form-text">
              Datos adicionales en formato JSON (opcional)
            </div>
          </div>
        </div>

        {/* Error general */}
        {errors.submit && (
          <div className="col-12">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {errors.submit}
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="col-12">
          <div className="d-flex gap-2 justify-content-end">
            <Button
              type="button"
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
              disabled={loading}
            >
              {alerta ? 'Actualizar' : 'Crear'} Alerta
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AlertaForm;