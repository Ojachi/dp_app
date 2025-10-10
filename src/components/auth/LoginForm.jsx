/**
 * Formulario de Login con validaciones
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { VALIDATION_RULES } from '../../utils/constants';

// Schema de validación
const loginSchema = yup.object({
  email: yup
    .string()
    .required(VALIDATION_RULES.EMAIL.required)
    .matches(VALIDATION_RULES.EMAIL.pattern.value, VALIDATION_RULES.EMAIL.pattern.message),
  password: yup
    .string()
    .required(VALIDATION_RULES.PASSWORD.required)
    .min(VALIDATION_RULES.PASSWORD.minLength.value, VALIDATION_RULES.PASSWORD.minLength.message)
});

const LoginForm = ({ onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange'
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Correo Electrónico
        </label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          id="email"
          placeholder="usuario@distribuciones.com"
          {...register('email')}
          disabled={loading}
        />
        {errors.email && (
          <div className="invalid-feedback">
            {errors.email.message}
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <input
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          id="password"
          placeholder="Ingresa tu contraseña"
          {...register('password')}
          disabled={loading}
        />
        {errors.password && (
          <div className="invalid-feedback">
            {errors.password.message}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary w-100"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </button>

      <div className="mt-3 text-center">
        <small className="text-muted">
          Usuarios de prueba:
          <br />
          <strong>Gerente:</strong> gerente@distribuciones.com
          <br />
          <strong>Vendedor:</strong> vendedor@distribuciones.com
          <br />
          <strong>Distribuidor:</strong> distribuidor@distribuciones.com
        </small>
      </div>
    </form>
  );
};

export default LoginForm;