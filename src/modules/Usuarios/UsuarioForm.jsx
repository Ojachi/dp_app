/**
 * UsuarioForm - Formulario para crear/editar usuarios
 */
import React, { useState, useEffect } from 'react';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import { useUsuarios } from '../../hooks/useUsuarios';

const UsuarioForm = ({ usuario, onSubmit, onCancel }) => {
  const { validarEmail, validarUsername } = useUsuarios();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    password: '',
    confirm_password: '',
    is_gerente: false,
    is_vendedor: false,
    is_distribuidor: false,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [validatingUsername, setValidatingUsername] = useState(false);

  // Cargar datos si es edición
  useEffect(() => {
    if (usuario) {
      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        first_name: usuario.first_name || '',
        last_name: usuario.last_name || '',
        telefono: usuario.telefono || '',
        direccion: usuario.direccion || '',
        ciudad: usuario.ciudad || '',
        password: '', // No mostrar contraseña existente
        confirm_password: '',
        is_gerente: usuario.is_gerente || false,
        is_vendedor: usuario.is_vendedor || false,
        is_distribuidor: usuario.is_distribuidor || false,
        is_active: usuario.is_active !== undefined ? usuario.is_active : true
      });
    }
  }, [usuario]);

  // Opciones para el selector de estado
  const opcionesEstado = [
    { value: true, label: 'Activo' },
    { value: false, label: 'Inactivo' }
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

    // Validación específica para roles (solo uno activo)
    if (campo === 'is_gerente' && valor) {
      setFormData(prev => ({
        ...prev,
        is_gerente: true,
        is_vendedor: false,
        is_distribuidor: false
      }));
    } else if (campo === 'is_vendedor' && valor) {
      setFormData(prev => ({
        ...prev,
        is_gerente: false,
        is_vendedor: true,
        is_distribuidor: false
      }));
    } else if (campo === 'is_distribuidor' && valor) {
      setFormData(prev => ({
        ...prev,
        is_gerente: false,
        is_vendedor: false,
        is_distribuidor: true
      }));
    }
  };

  // Validación de email único
  const handleEmailBlur = async () => {
    if (formData.email && formData.email !== usuario?.email) {
      setValidatingEmail(true);
      try {
        const result = await validarEmail(formData.email, usuario?.id);
        if (!result.valid) {
          setErrors(prev => ({
            ...prev,
            email: result.message
          }));
        }
      } catch (error) {
        console.error('Error validando email:', error);
      } finally {
        setValidatingEmail(false);
      }
    }
  };

  // Validación de username único
  const handleUsernameBlur = async () => {
    if (formData.username && formData.username !== usuario?.username) {
      setValidatingUsername(true);
      try {
        const result = await validarUsername(formData.username, usuario?.id);
        if (!result.valid) {
          setErrors(prev => ({
            ...prev,
            username: result.message
          }));
        }
      } catch (error) {
        console.error('Error validando username:', error);
      } finally {
        setValidatingUsername(false);
      }
    }
  };

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    // Username obligatorio
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Solo se permiten letras, números y guiones bajos';
    }

    // Email obligatorio
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    // Nombres obligatorios
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es obligatorio';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es obligatorio';
    }

    // Contraseña (solo para usuarios nuevos o si se especifica)
    if (!usuario && !formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Confirmación de contraseña
    if (formData.password && formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Las contraseñas no coinciden';
    }

    // Al menos un rol debe estar seleccionado
    if (!formData.is_gerente && !formData.is_vendedor && !formData.is_distribuidor) {
      newErrors.roles = 'Debe seleccionar al menos un rol';
    }

    // Validar teléfono si se proporciona
    if (formData.telefono && !/^[+]?[\d\s\-()]{7,}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono no tiene un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        ...formData
      };

      // No enviar contraseña vacía en edición
      if (usuario && !dataToSubmit.password) {
        delete dataToSubmit.password;
        delete dataToSubmit.confirm_password;
      }

      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setErrors({
        submit: 'Error al guardar el usuario. Por favor, intente nuevamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Username */}
        <div className="col-md-6">
          <Input
            label="Nombre de Usuario *"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={handleUsernameBlur}
            placeholder="usuario123"
            error={errors.username}
            loading={validatingUsername}
            required
            helperText="Solo letras, números y guiones bajos"
          />
        </div>

        {/* Email */}
        <div className="col-md-6">
          <Input
            type="email"
            label="Email *"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="usuario@ejemplo.com"
            error={errors.email}
            loading={validatingEmail}
            required
          />
        </div>

        {/* Nombres */}
        <div className="col-md-6">
          <Input
            label="Nombre *"
            value={formData.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            placeholder="Juan"
            error={errors.first_name}
            required
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Apellido *"
            value={formData.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            placeholder="Pérez"
            error={errors.last_name}
            required
          />
        </div>

        {/* Contraseñas (solo para nuevo usuario o si se quiere cambiar) */}
        {!usuario && (
          <>
            <div className="col-md-6">
              <Input
                type="password"
                label="Contraseña *"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                error={errors.password}
                required
              />
            </div>

            <div className="col-md-6">
              <Input
                type="password"
                label="Confirmar Contraseña *"
                value={formData.confirm_password}
                onChange={(e) => handleChange('confirm_password', e.target.value)}
                placeholder="Repetir contraseña"
                error={errors.confirm_password}
                required
              />
            </div>
          </>
        )}

        {/* Información de contacto */}
        <div className="col-md-6">
          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => handleChange('telefono', e.target.value)}
            placeholder="+57 300 123 4567"
            error={errors.telefono}
          />
        </div>

        <div className="col-md-6">
          <Input
            label="Ciudad"
            value={formData.ciudad}
            onChange={(e) => handleChange('ciudad', e.target.value)}
            placeholder="Bogotá"
            error={errors.ciudad}
          />
        </div>

        {/* Dirección */}
        <div className="col-12">
          <Input
            label="Dirección"
            value={formData.direccion}
            onChange={(e) => handleChange('direccion', e.target.value)}
            placeholder="Calle 123 #45-67"
            error={errors.direccion}
          />
        </div>

        {/* Roles */}
        <div className="col-12">
          <label className="form-label">Rol del Usuario *</label>
          <div className="row">
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="is_gerente"
                  name="rol"
                  checked={formData.is_gerente}
                  onChange={(e) => handleChange('is_gerente', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="is_gerente">
                  <span className="badge bg-success me-2">Gerente</span>
                  Acceso completo
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="is_vendedor"
                  name="rol"
                  checked={formData.is_vendedor}
                  onChange={(e) => handleChange('is_vendedor', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="is_vendedor">
                  <span className="badge bg-primary me-2">Vendedor</span>
                  Ventas y facturas
                </label>
              </div>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="is_distribuidor"
                  name="rol"
                  checked={formData.is_distribuidor}
                  onChange={(e) => handleChange('is_distribuidor', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="is_distribuidor">
                  <span className="badge bg-info me-2">Distribuidor</span>
                  Distribución
                </label>
              </div>
            </div>
          </div>
          {errors.roles && (
            <div className="text-danger small mt-1">{errors.roles}</div>
          )}
        </div>

        {/* Estado del usuario */}
        <div className="col-md-6">
          <Select
            label="Estado del Usuario"
            value={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.value === 'true')}
            options={opcionesEstado}
          />
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
              disabled={loading || validatingEmail || validatingUsername}
            >
              {usuario ? 'Actualizar' : 'Crear'} Usuario
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UsuarioForm;