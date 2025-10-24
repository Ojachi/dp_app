/**
 * Formulario para crear/editar pagos alineado con el contrato del backend
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { pagosService } from '../../../services/pagosService';
import { facturasService } from '../../../services/facturasService';
import { Button } from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../components/Toast';

const toIsoDateTime = (date) => (date ? `${date}T00:00:00` : null);
const createDefaultFormData = () => ({
  factura_id: '',
  valor_pagado: '',
  tipo_pago: '',
  fecha_pago: new Date().toISOString().split('T')[0],
  notas: '',
  tiene_nota: false,
  valor_nota: '',
  motivo_nota: '',
  descuento: '',
  retencion: '',
  ica: '',
  cuenta: '',
  comprobante_b64: '', // Base64 generado desde archivo (imagen/pdf)
});

const PagoForm = ({ pago, onSubmit, onCancel, initialLoading = false }) => {
  const { isGerente } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState(createDefaultFormData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [metodosPago, setMetodosPago] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [facturasPendientes, setFacturasPendientes] = useState([]);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [confirming, setConfirming] = useState(false);
  // Gestión de cuentas removida del formulario de pagos. La administración de cuentas
  // ahora se realiza únicamente desde Parametrización > Cuentas de pago.

  const metodoSeleccionado = useMemo(
    () => metodosPago.find((metodo) => metodo.id === formData.tipo_pago),
    [metodosPago, formData.tipo_pago]
  );

  const { user, isVendedor } = useAuth();

  // Flags FE-only ya aplicados en la factura seleccionada
  const [feYaAplicoRetencion, setFeYaAplicoRetencion] = useState(false);
  const [feYaAplicoIca, setFeYaAplicoIca] = useState(false);

  const isFE = facturaSeleccionada?.tipo === 'FE';
  // FE-only: mostrar retención e ICA solo para facturas FE y si no han sido aplicadas previamente en la factura
  const mostrarRetencion = (isGerente() || isVendedor()) && isFE && !feYaAplicoRetencion;
  const mostrarICA = (isGerente() || isVendedor()) && isFE && !feYaAplicoIca;
  // Inferir por nombre del método si es consignación o efectivo
  const metodoNombre = (metodoSeleccionado?.nombre || '').toLowerCase();
  const esConsignacion = formData.tipo_pago === 'consignacion' || /consign/.test(metodoNombre);
  // const esEfectivo = formData.tipo_pago === 'efectivo' || /efectiv/.test(metodoNombre);

  const parseNumber = (v) => {
    const n = Number.parseFloat(String(v).replace(/,/g, '.'));
    return Number.isNaN(n) ? 0 : n;
  };
  const valorBase = parseNumber(formData.valor_pagado);
  const valorNota = formData.tiene_nota ? parseNumber(formData.valor_nota) : 0;
  const descuento = parseNumber(formData.descuento);
  const retencion = mostrarRetencion ? parseNumber(formData.retencion) : 0;
  const ica = mostrarICA ? parseNumber(formData.ica) : 0;
  // Bajo la nueva lógica, todo lo anterior aplica a la factura (suma)
  const totalAplicado = Math.max(0, valorBase + valorNota + descuento + retencion + ica);

  const setDefaultsFromPago = useCallback(() => {
    if (!pago) {
      setFormData(createDefaultFormData());
      setFacturaSeleccionada(null);
      return;
    }

    const facturaId = pago.factura?.id ?? pago.factura_id ?? pago.factura ?? '';
    setFormData({
      factura_id: facturaId ? String(facturaId) : '',
      valor_pagado: pago.valor_pagado !== undefined && pago.valor_pagado !== null
        ? String(pago.valor_pagado)
        : '',
      tipo_pago: pago.tipo_pago || '',
      fecha_pago: pago.fecha_pago ? pago.fecha_pago.split('T')[0] : createDefaultFormData().fecha_pago,
      notas: pago.notas || '',
      tiene_nota: false,
      valor_nota: '',
      motivo_nota: '',
      descuento: '',
      retencion: '',
      ica: '',
  cuenta: pago.cuenta || '',
      comprobante_b64: '',
    });
    setFacturaSeleccionada(pago.factura || null);
  }, [pago]);

  const loadInitialData = useCallback(async () => {
    try {
      const [metodos, facturas, cuentasResp] = await Promise.all([
        pagosService.getMetodosPago(),
        facturasService.getFacturas({ saldo_pendiente: 'con_saldo', page_size: 100 }),
        pagosService.getCuentas(),
      ]);

      const facturasList = Array.isArray(facturas?.results) ? facturas.results : (Array.isArray(facturas) ? facturas : []);
      const shouldAppendFactura = pago?.factura && !facturasList.some((item) => item.id === pago.factura.id);

      // Solo mostrar Efectivo y Consignación, pero si estamos editando un pago de otro tipo, incluirlo para no romper
      const permitidos = new Set(['efectivo', 'consignacion']);
      const filtrados = (metodos || []).filter((m) => permitidos.has(m.id));
      const yaIncluido = filtrados.some((m) => m.id === (pago?.tipo_pago || ''));
      const metodosFinal = yaIncluido || !pago?.tipo_pago
        ? filtrados
        : [...filtrados, (metodos || []).find((m) => m.id === pago.tipo_pago)].filter(Boolean);

      setMetodosPago(metodosFinal || []);
      setCuentas(cuentasResp || []);
      setFacturasPendientes(shouldAppendFactura ? [pago.factura, ...facturasList] : facturasList);
    } catch (error) {
      console.error('Error al cargar datos iniciales:', error);
    }
  }, [pago]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    setDefaultsFromPago();
  }, [setDefaultsFromPago]);

  useEffect(() => {
    if (!formData.factura_id) {
      setFacturaSeleccionada(pago?.factura || null);
      setFeYaAplicoRetencion(false);
      setFeYaAplicoIca(false);
      return;
    }

    const selected = facturasPendientes.find((factura) => String(factura.id) === formData.factura_id);
    setFacturaSeleccionada(selected || pago?.factura || null);
    // Cargar pagos confirmados para saber si FE-only ya fue aplicado
    const cargarPagosFactura = async (facturaId) => {
      try {
        const data = await pagosService.getPagosByFactura(facturaId);
        const lista = Array.isArray(data?.pagos) ? data.pagos : (Array.isArray(data) ? data : []);
        const confirmados = lista.filter((p) => p.estado === 'confirmado');
        const yaRetencion = confirmados.some((p) => Number(p.retencion || 0) > 0);
        const yaIca = confirmados.some((p) => Number(p.ica || 0) > 0);
        setFeYaAplicoRetencion(!!yaRetencion);
        setFeYaAplicoIca(!!yaIca);
      } catch (e) {
        // Si falla, conservamos flags en false para no bloquear
        setFeYaAplicoRetencion(false);
        setFeYaAplicoIca(false);
      }
    };
    const idNum = Number.parseInt(formData.factura_id, 10);
    if (!Number.isNaN(idNum)) {
      cargarPagosFactura(idNum);
    }
  }, [formData.factura_id, facturasPendientes, pago]);

  const formatCurrency = (amount) => {
    const numericValue = Number.parseFloat(amount || 0) || 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(numericValue);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (name === 'factura_id' && !pago) {
      const factura = facturasPendientes.find((item) => String(item.id) === value);
      if (factura && !formData.valor_pagado) {
        setFormData((prev) => ({
          ...prev,
          valor_pagado: String(factura.saldo_pendiente || ''),
        }));
      }
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Convertir archivo (imagen/pdf) a base64 y guardarlo en el formulario
  const handleComprobanteFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, comprobante_b64: '' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result; // data:*/*;base64,AAA...
        if (typeof result === 'string') {
          const comma = result.indexOf(',');
          const base64 = comma >= 0 ? result.substring(comma + 1) : result;
          setFormData((prev) => ({ ...prev, comprobante_b64: base64 }));
        }
      } catch (err) {
        console.error('Error leyendo comprobante:', err);
        setFormData((prev) => ({ ...prev, comprobante_b64: '' }));
      }
    };
    reader.onerror = () => {
      console.error('No se pudo leer el archivo de comprobante');
      setFormData((prev) => ({ ...prev, comprobante_b64: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.factura_id) {
      newErrors.factura_id = 'Debe seleccionar una factura';
    }

    const saldo = facturaSeleccionada ? Number.parseFloat(facturaSeleccionada.saldo_pendiente || 0) : null;
    if (!pago) {
      const hayAlgunaAplicacion = (valorBase > 0) || (valorNota > 0) || (descuento > 0) || (retencion > 0) || (ica > 0);
      if (!hayAlgunaAplicacion) {
        newErrors.valor_pagado = 'Ingrese al menos un valor (pago, descuento, retención, ICA o nota)';
      }
      if (saldo !== null && !Number.isNaN(saldo) && totalAplicado > saldo) {
        newErrors.valor_pagado = 'El total a aplicar excede el saldo pendiente';
      }
    }

    if (!formData.tipo_pago) {
      newErrors.tipo_pago = 'Debe seleccionar un método de pago';
    }

    if (!formData.fecha_pago) {
      newErrors.fecha_pago = 'La fecha de pago es requerida';
    }

    // Ya no se exige referencia/numero de comprobante

    if (formData.tiene_nota) {
      if (!formData.valor_nota || parseNumber(formData.valor_nota) <= 0) {
        newErrors.valor_nota = 'Ingrese un valor de nota válido (> 0)';
      }
      if (!formData.motivo_nota) {
        newErrors.motivo_nota = 'Ingrese el motivo de la nota';
      }
    }

    if (mostrarRetencion && formData.retencion && parseNumber(formData.retencion) < 0) {
      newErrors.retencion = 'La retención no puede ser negativa';
    }
    if (mostrarICA && formData.ica && parseNumber(formData.ica) < 0) {
      newErrors.ica = 'El ICA no puede ser negativo';
    }

    if (esConsignacion) {
      if (!formData.cuenta) {
        newErrors.cuenta = 'Indique la cuenta de pago';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    // Componer notas extendidas con campos adicionales
    const notasExtras = [];
    if (formData.tiene_nota) {
      notasExtras.push(`Nota: ${parseNumber(formData.valor_nota)} - ${formData.motivo_nota}`);
    }
    if (formData.descuento) {
      notasExtras.push(`Descuento: ${parseNumber(formData.descuento)}`);
    }
    if (mostrarRetencion && formData.retencion) {
      notasExtras.push(`Retención: ${parseNumber(formData.retencion)}`);
    }
    if (mostrarICA && formData.ica) {
      notasExtras.push(`ICA: ${parseNumber(formData.ica)}`);
    }
    if (esConsignacion) {
      if (formData.cuenta) notasExtras.push(`Cuenta: ${formData.cuenta}`);
    }
    const notasCompuestas = [formData.notas, ...notasExtras].filter(Boolean).join(' | ') || null;

    const basePayload = {
      fecha_pago: toIsoDateTime(formData.fecha_pago),
      tipo_pago: formData.tipo_pago,
      notas: notasCompuestas,
    };

    if (pago) {
      return basePayload;
    }

    const valor = valorBase;
    return {
      ...basePayload,
      factura_id: Number.parseInt(formData.factura_id, 10),
      valor_pagado: Number.isNaN(valor) ? 0 : valor,
      descuento: Number.isNaN(descuento) ? 0 : descuento,
      retencion: Number.isNaN(retencion) ? 0 : retencion,
      ica: Number.isNaN(ica) ? 0 : ica,
      nota: Number.isNaN(valorNota) ? 0 : valorNota,
      // Adjuntos: archivo -> base64 (comprobante_b64)
      ...(formData.comprobante_b64 ? { comprobante_b64: formData.comprobante_b64 } : {}),
      ...(formData.cuenta ? { cuenta: formData.cuenta } : {}),
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(buildPayload());
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando formulario...</span>
        </div>
        <p className="mt-3 text-muted">Preparando información del pago...</p>
      </div>
    );
  }

  const isEditing = Boolean(pago);
  const fieldsDisabled = submitting || (isEditing && !isGerente());
  const dateDisabled = fieldsDisabled || !isGerente();

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        {/* Responsable del pago */}
        <div className="col-12">
          <label className="form-label">Responsable del pago</label>
          <input
            type="text"
            className="form-control"
            value={user?.full_name || user?.name || user?.email || 'Usuario actual'}
            disabled
          />
          <small className="text-muted">El pago se registrará a nombre del usuario autenticado.</small>
        </div>

        <div className="col-12">
          <label className="form-label">
            Factura <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.factura_id ? 'is-invalid' : ''}`}
            name="factura_id"
            value={formData.factura_id}
            onChange={handleInputChange}
            disabled={fieldsDisabled || Boolean(pago)}
          >
            <option value="">Seleccionar factura...</option>
            {facturasPendientes.map((factura) => (
              <option key={factura.id} value={factura.id}>
                {factura.numero_factura || factura.numero || `Factura #${factura.id}`} - {factura.cliente_nombre || factura.cliente?.nombre || 'Cliente sin nombre'} - Pendiente: {formatCurrency(factura.saldo_pendiente)}
              </option>
            ))}
          </select>
          {errors.factura_id && <div className="invalid-feedback">{errors.factura_id}</div>}
          {facturaSeleccionada && (
            <div className="mt-2 p-2 bg-light rounded">
              <small>
                <strong>Cliente:</strong> {facturaSeleccionada.cliente_nombre || facturaSeleccionada.cliente?.nombre || 'N/D'}<br />
                <strong>Total factura:</strong> {formatCurrency(facturaSeleccionada.valor_total || facturaSeleccionada.total)}<br />
                <strong>Saldo pendiente:</strong> {formatCurrency(facturaSeleccionada.saldo_pendiente)}<br />
                {facturaSeleccionada.fecha_vencimiento && (
                  <>
                    <strong>Vence:</strong> {new Date(facturaSeleccionada.fecha_vencimiento).toLocaleDateString('es-CO')}<br />
                  </>
                )}
                {isFE && (feYaAplicoRetencion || feYaAplicoIca) && (
                  <>
                    <strong>FE-only:</strong> {feYaAplicoRetencion ? 'Retención aplicada' : ''}{feYaAplicoRetencion && feYaAplicoIca ? ' | ' : ''}{feYaAplicoIca ? 'ICA aplicado' : ''}
                  </>
                )}
              </small>
            </div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Valor pagado {!pago && <span className="text-danger">*</span>}
          </label>
          <div className="input-group">
            <span className="input-group-text">$</span>
            <input
              type="number"
              className={`form-control ${errors.valor_pagado ? 'is-invalid' : ''}`}
              name="valor_pagado"
              value={formData.valor_pagado}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              step="0.01"
              disabled={fieldsDisabled || Boolean(pago)}
            />
            {errors.valor_pagado && <div className="invalid-feedback">{errors.valor_pagado}</div>}
          </div>
          {!pago && facturaSeleccionada && (valorBase > 0 || valorNota > 0 || descuento > 0 || retencion > 0 || ica > 0) && (
            <small className="text-muted">
              Saldo restante: {formatCurrency((Number.parseFloat(facturaSeleccionada.saldo_pendiente || 0) || 0) - totalAplicado)}
            </small>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Tipo de pago <span className="text-danger">*</span>
          </label>
          <select
            className={`form-select ${errors.tipo_pago ? 'is-invalid' : ''}`}
            name="tipo_pago"
            value={formData.tipo_pago}
            onChange={handleInputChange}
            disabled={fieldsDisabled}
          >
            <option value="">Seleccionar método...</option>
            {metodosPago.map((metodo) => (
              <option key={metodo.id} value={metodo.id}>
                {metodo.nombre}
              </option>
            ))}
          </select>
          {errors.tipo_pago && <div className="invalid-feedback">{errors.tipo_pago}</div>}
          {metodoSeleccionado?.descripcion && (
            <small className="text-muted d-block mt-1">{metodoSeleccionado.descripcion}</small>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Fecha de pago <span className="text-danger">*</span>
          </label>
          <input
            type="date"
            className={`form-control ${errors.fecha_pago ? 'is-invalid' : ''}`}
            name="fecha_pago"
            value={formData.fecha_pago}
            onChange={handleInputChange}
            disabled={dateDisabled}
          />
          {errors.fecha_pago && <div className="invalid-feedback">{errors.fecha_pago}</div>}
        </div>

        {/* Campo de referencia/comprobante eliminado según requerimiento */}

        {/* Tiene nota? */}
        <div className="col-md-4 d-flex align-items-end">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="tieneNota"
              name="tiene_nota"
              checked={formData.tiene_nota}
              onChange={handleCheckboxChange}
              disabled={fieldsDisabled}
            />
            <label className="form-check-label" htmlFor="tieneNota">
              ¿Tiene nota?
            </label>
          </div>
        </div>
        {formData.tiene_nota && (
          <>
            <div className="col-md-4">
              <label className="form-label">Valor de nota</label>
              <input
                type="number"
                className={`form-control ${errors.valor_nota ? 'is-invalid' : ''}`}
                name="valor_nota"
                value={formData.valor_nota}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                disabled={fieldsDisabled}
              />
              {errors.valor_nota && <div className="invalid-feedback">{errors.valor_nota}</div>}
            </div>
            <div className="col-md-4">
              <label className="form-label">Motivo nota</label>
              <input
                type="text"
                className={`form-control ${errors.motivo_nota ? 'is-invalid' : ''}`}
                name="motivo_nota"
                value={formData.motivo_nota}
                onChange={handleInputChange}
                disabled={fieldsDisabled}
              />
              {errors.motivo_nota && <div className="invalid-feedback">{errors.motivo_nota}</div>}
            </div>
          </>
        )}

        {/* Descuento */}
        <div className="col-md-4">
          <label className="form-label">Descuento</label>
          <input
            type="number"
            className="form-control"
            name="descuento"
            value={formData.descuento}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            disabled={fieldsDisabled}
          />
        </div>

        {/* Retención (FE) */}
        {mostrarRetencion && (
          <div className="col-md-4">
            <label className="form-label">Retención</label>
            <input
              type="number"
              className={`form-control ${errors.retencion ? 'is-invalid' : ''}`}
              name="retencion"
              value={formData.retencion}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              disabled={fieldsDisabled}
            />
            {errors.retencion && <div className="invalid-feedback">{errors.retencion}</div>}
          </div>
        )}

        {/* ICA (R) */}
        {mostrarICA && (
          <div className="col-md-4">
            <label className="form-label">ICA</label>
            <input
              type="number"
              className={`form-control ${errors.ica ? 'is-invalid' : ''}`}
              name="ica"
              value={formData.ica}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              disabled={fieldsDisabled}
            />
            {errors.ica && <div className="invalid-feedback">{errors.ica}</div>}
          </div>
        )}

        {/* Cuenta de pago y comprobante (Consignación) */}
        {esConsignacion && (
          <>
            <div className="col-md-6">
              <label className="form-label">Cuenta de pago</label>
              <select
                className={`form-select ${errors.cuenta ? 'is-invalid' : ''}`}
                name="cuenta"
                value={formData.cuenta}
                onChange={handleInputChange}
                disabled={fieldsDisabled}
              >
                <option value="">Seleccionar cuenta...</option>
                {cuentas.map((c) => (
                  <option key={c.id || c.nombre} value={c.id}>
                    {c.nombre} {c.numero ? `- ${c.numero}` : ''}
                  </option>
                ))}
              </select>
              {errors.cuenta && <div className="invalid-feedback">{errors.cuenta}</div>}
            </div>
          </>
        )}

        {/* Comprobante (imagen o PDF) opcional: se convierte a base64 y se envía como comprobante_b64 */}
        <div className="col-md-6">
          <label className="form-label">Comprobante (imagen o PDF) — opcional</label>
          <input
            type="file"
            className="form-control"
            name="comprobante_b64_file"
            accept="image/*,application/pdf"
            onChange={handleComprobanteFile}
            disabled={fieldsDisabled}
          />
          {formData.comprobante_b64 && (
            <small className="text-muted">Archivo cargado. Se guardará como base64.</small>
          )}
        </div>

        {/* Firma del cliente (Efectivo) */}
        {/* Firma/Comprobante por archivo eliminados: sólo base64 si se implementa más adelante */}

        <div className="col-12">
          <label className="form-label">Notas</label>
          <textarea
            className="form-control"
            name="notas"
            value={formData.notas}
            onChange={handleInputChange}
            rows="3"
            placeholder="Notas adicionales sobre el pago"
            disabled={fieldsDisabled}
          />
        </div>

        {/* Resumen de cálculo */}
        <div className="col-12">
          <div className="alert alert-info py-2">
            <div className="d-flex flex-wrap gap-3 align-items-center">
              <div><strong>Pago:</strong> {formatCurrency(valorBase)}</div>
              {formData.tiene_nota && <div><strong>Nota:</strong> +{formatCurrency(valorNota)}</div>}
              {descuento > 0 && <div><strong>Descuento:</strong> +{formatCurrency(descuento)}</div>}
              {retencion > 0 && <div><strong>Retención:</strong> +{formatCurrency(retencion)}</div>}
              {ica > 0 && <div><strong>ICA:</strong> +{formatCurrency(ica)}</div>}
              <div className="ms-auto"><strong>Total a aplicar:</strong> {formatCurrency(totalAplicado)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de cuentas eliminada: selección únicamente de cuentas existentes */}

      <div className="d-flex justify-content-end gap-2 mt-4">
        {!isGerente() && !isEditing && (
          <div className="me-auto small text-muted">
            Este pago quedará registrado y un Gerente debe confirmarlo para aplicarlo a la factura.
          </div>
        )}
        <Button
          type="button"
          variant="outline-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </Button>
        {isGerente() && isEditing && pago?.estado !== 'confirmado' && (
          <Button
            type="button"
            variant="success"
            disabled={confirming}
            onClick={async () => {
              try {
                setConfirming(true);
                await pagosService.confirmPago(pago.id);
                toast.success('Pago confirmado y aplicado a la factura');
                onSubmit({ __action__: 'confirmed' });
              } catch (err) {
                toast.error(err.message || 'No fue posible confirmar el pago');
              } finally {
                setConfirming(false);
              }
            }}
          >
            {confirming && <span className="spinner-border spinner-border-sm me-2"></span>}
            Confirmar pago
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
        >
          {submitting && <span className="spinner-border spinner-border-sm me-2"></span>}
          {pago ? 'Actualizar' : 'Registrar'} pago
        </Button>
      </div>
    </form>
  );
};

export default PagoForm;