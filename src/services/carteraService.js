import apiClient from './api';

const sampleCarteraData = {
  resumen: {
    totalCartera: 2450000,
    cuentasPorCobrar: 1850000,
    facturasPendientes: 47,
    clientesConMora: 12,
    diasPromedioCobranza: 35,
    porcentajeMora: 15.8
  },
  cuentasPorCobrar: [
    {
      id: 1,
      cliente: 'Distribuidora Central S.A.',
      ruc: '20123456789',
      telefono: '+57 300 123 4567',
      email: 'facturacion@distribuidora.com',
      totalDeuda: 485000,
      facturasPendientes: 8,
      facturaVencida: {
        numero: 'FAC-2024-1205',
        fechaVencimiento: '2024-09-15',
        monto: 125000,
        diasVencido: 25
      },
      historialPagos: 'Buen pagador',
      limiteCredito: 800000,
      estado: 'En mora'
    },
    {
      id: 2,
      cliente: 'Comercial Los Andes Ltda.',
      ruc: '20987654321',
      telefono: '+57 301 987 6543',
      email: 'contabilidad@losandes.com',
      totalDeuda: 320000,
      facturasPendientes: 5,
      facturaVencida: null,
      historialPagos: 'Excelente',
      limiteCredito: 500000,
      estado: 'Al día'
    }
  ],
  estadisticasMora: [
    { rango: '0-30', cantidad: 8, monto: 580000, porcentaje: 31.4 },
    { rango: '31-60', cantidad: 3, monto: 405000, porcentaje: 21.9 },
    { rango: '61-90', cantidad: 1, monto: 125000, porcentaje: 6.8 },
    { rango: '90+', cantidad: 0, monto: 0, porcentaje: 0 }
  ],
  proyeccionCobranza: [
    { mes: '2024-10', estimado: 650000, facturas: 6, probabilidad: 85, real: 0 },
    { mes: '2024-11', estimado: 520000, facturas: 5, probabilidad: 75, real: 0 }
  ]
};

const TIPO_LABELS = {
  llamada: 'Llamada telefónica',
  correo: 'Email',
  visita: 'Visita comercial',
  mensaje: 'WhatsApp',
  otro: 'Otro'
};

const TIPO_TO_API = {
  'Llamada telefónica': 'llamada',
  'Email': 'correo',
  'Visita comercial': 'visita',
  'WhatsApp': 'mensaje',
  'Carta formal': 'otro',
  'Otro': 'otro'
};

const RESULTADO_LABELS = {
  promesa_pago: 'Compromiso de pago',
  no_contactado: 'Sin respuesta',
  recordatorio: 'Recordatorio',
  negociacion: 'Negociación',
  otro: 'Otro'
};

const RESULTADO_TO_API = {
  'Compromiso de pago': 'promesa_pago',
  'Plan de pagos acordado': 'negociacion',
  'Sin respuesta': 'no_contactado',
  'Cliente no disponible': 'no_contactado',
  'Recordatorio de pago': 'recordatorio',
  'Pago realizado': 'otro',
  'Disputa comercial': 'otro',
  'Otro': 'otro'
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const capitalize = (value) => {
  if (!value) return '';
  const text = value.toString();
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const daysOverdue = (fechaVencimiento) => {
  if (!fechaVencimiento) return 0;
  const today = new Date();
  const dueDate = new Date(fechaVencimiento);
  const diff = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
};

const normalizeFacturaListado = (factura) => ({
  id: factura.id,
  numero: factura.numero_factura,
  fecha: factura.fecha_emision,
  vencimiento: factura.fecha_vencimiento,
  monto: toNumber(factura.valor_total),
  saldo: toNumber(factura.saldo_pendiente),
  estado: capitalize(factura.estado) || 'Pendiente',
  diasVencido: Math.max(factura.dias_vencimiento ?? 0, 0),
  estaVencida: Boolean(factura.esta_vencida)
});

const normalizeCuenta = (entrada) => {
  const cliente = entrada.cliente || {};
  const facturas = entrada.facturas || [];
  const primeraVencida = facturas.find((factura) => factura.esta_vencida || factura.estado === 'vencida');

  return {
    id: cliente.id ?? null,
    cliente: cliente.nombre || 'Cliente sin nombre',
  ruc: cliente.identificacion || cliente.documento || (cliente.id ? `ID-${cliente.id}` : 'N/D'),
    telefono: cliente.telefono || 'N/D',
    email: cliente.email || 'N/D',
    totalDeuda: toNumber(entrada.total_pendiente),
    facturasPendientes: facturas.length,
    facturaVencida: primeraVencida
      ? {
          numero: primeraVencida.numero_factura,
          fechaVencimiento: primeraVencida.fecha_vencimiento,
          monto: toNumber(primeraVencida.saldo_pendiente ?? primeraVencida.valor_total),
          diasVencido: Math.max(
            primeraVencida.dias_vencimiento ?? daysOverdue(primeraVencida.fecha_vencimiento),
            0
          )
        }
      : null,
    historialPagos: primeraVencida
      ? 'Riesgo alto'
      : cliente.saldo_pendiente > 0
        ? 'Buen pagador'
        : 'Excelente',
    limiteCredito: toNumber(entrada.limite_credito),
    estado: primeraVencida ? 'En mora' : 'Al día',
    facturas: facturas.map(normalizeFacturaListado)
  };
};

const normalizeDetalle = (payload) => {
  const cliente = payload.cliente || {};
  const facturas = payload.facturas || [];
  const pagos = payload.pagos_recientes || [];
  const vencida = facturas.find((factura) => factura.esta_vencida || factura.estado === 'vencida');

  return {
    id: cliente.id ?? null,
    cliente: cliente.nombre || 'Cliente sin nombre',
  ruc: cliente.nit || cliente.identificacion || cliente.documento || (cliente.id ? `ID-${cliente.id}` : 'N/D'),
    telefono: cliente.telefono || 'N/D',
    email: cliente.email || 'N/D',
    historialPagos: vencida ? 'Riesgo alto' : cliente.saldo_pendiente > 0 ? 'Buen pagador' : 'Excelente',
    estado: vencida ? 'En mora' : 'Al día',
    totalDeuda: toNumber(payload.total_pendiente),
    limiteCredito: toNumber(payload.limite_credito),
    facturasPendientes: facturas.filter((f) => (f.estado || '').toLowerCase() !== 'pagada').length,
    facturas: facturas.map(normalizeFacturaListado),
    pagos: pagos.map((pago) => ({
      fecha: pago.fecha_pago,
      factura: pago.factura_numero || `Factura #${pago.factura}`,
      monto: toNumber(pago.valor_pagado),
      metodo: capitalize(pago.tipo_pago),
      referencia: pago.numero_comprobante || 'N/D'
    }))
  };
};

const normalizeResumen = (payload) => ({
  totalCartera: toNumber(payload.total_cartera ?? payload.totalCartera),
  cuentasPorCobrar: toNumber(payload.cuentas_por_cobrar ?? payload.cuentasPorCobrar),
  facturasPendientes: payload.facturas_pendientes ?? payload.facturasPendientes ?? 0,
  clientesConMora: payload.clientes_con_mora ?? payload.clientesConMora ?? 0,
  diasPromedioCobranza: payload.dias_promedio_cobranza ?? payload.diasPromedioCobranza ?? 0,
  porcentajeMora: Number(payload.porcentaje_mora ?? payload.porcentajeMora ?? 0)
});

const normalizeEstadisticas = (items) => {
  const totalFacturas = items.reduce((sum, item) => sum + (item.total_facturas ?? 0), 0) || 1;
  return items.map((item) => ({
    rango: item.rango,
    cantidad: item.total_facturas ?? 0,
    monto: toNumber(item.monto_total),
    porcentaje: Math.round(((item.total_facturas ?? 0) / totalFacturas) * 100)
  }));
};

const normalizeProyeccion = (items) =>
  items.map((item) => ({
    mes: item.mes,
    estimado: toNumber(item.monto_estimado),
    facturas: item.facturas ?? 0,
    probabilidad: item.facturas ? Math.min(95, 50 + item.facturas * 5) : 60,
    real: 0
  }));

const normalizeHistorial = (items) =>
  items.map((item) => ({
    id: item.id,
    tipo: TIPO_LABELS[item.tipo] || item.tipo,
    resultado: RESULTADO_LABELS[item.resultado] || item.resultado,
    observaciones: item.observaciones || '',
    fecha: item.creado,
    usuario: item.usuario_nombre || item.usuario?.nombre || 'Equipo de cobranza',
    proximoContacto: item.proximo_contacto || null
  }));

class CarteraService {
  async getResumenCartera() {
    try {
      const { data } = await apiClient.get('/cartera/resumen/');
      return normalizeResumen(data);
    } catch (error) {
      console.warn('Usando datos de ejemplo para resumen de cartera', error);
      return sampleCarteraData.resumen;
    }
  }

  async getCuentasPorCobrar(filtros = {}) {
    try {
      const params = {};
      const clienteId = filtros.clienteId || filtros.cliente;
      if (clienteId && /^\d+$/.test(String(clienteId).trim())) {
        params.cliente = String(clienteId).trim();
      }
      if (filtros.estado === 'vencida') {
        params.estado = 'vencida';
      }
      if (filtros.montoMin) params.monto_min = filtros.montoMin;
      if (filtros.montoMax) params.monto_max = filtros.montoMax;

      const { data } = await apiClient.get('/cartera/cuentas-por-cobrar/', { params });
      const cuentas = Array.isArray(data) ? data.map(normalizeCuenta) : [];

      return {
        cuentas,
        total: cuentas.length,
        totalMonto: cuentas.reduce((sum, cuenta) => sum + cuenta.totalDeuda, 0)
      };
    } catch (error) {
      console.warn('Usando datos de ejemplo para cuentas por cobrar', error);
      const cuentas = sampleCarteraData.cuentasPorCobrar;
      return {
        cuentas,
        total: cuentas.length,
        totalMonto: cuentas.reduce((sum, cuenta) => sum + cuenta.totalDeuda, 0)
      };
    }
  }

  async getDetalleCuenta(clienteId) {
    try {
      const { data } = await apiClient.get(`/cartera/clientes/${clienteId}/detalle/`);
      return normalizeDetalle(data);
    } catch (error) {
      console.warn('Usando datos de ejemplo para detalle de cuenta', error);
      const cuenta = sampleCarteraData.cuentasPorCobrar.find((c) => c.id === Number(clienteId));
      if (!cuenta) throw new Error('Cliente no encontrado');

      return {
        ...cuenta,
        facturas: (cuenta.facturas || []).map((factura) => ({
          ...factura,
          estado: factura.estado || 'Pendiente',
          diasVencido: factura.diasVencido || 0
        })),
        pagos: [],
        limiteCredito: cuenta.limiteCredito || 0,
        totalDeuda: cuenta.totalDeuda || 0,
        facturasPendientes: cuenta.facturasPendientes || 0
      };
    }
  }

  async getEstadisticasMora() {
    try {
      const { data } = await apiClient.get('/cartera/estadisticas/mora/');
      return normalizeEstadisticas(data);
    } catch (error) {
      console.warn('Usando datos de ejemplo para estadísticas de mora', error);
      return sampleCarteraData.estadisticasMora;
    }
  }

  async getProyeccionCobranza() {
    try {
      const { data } = await apiClient.get('/cartera/proyeccion/');
      return normalizeProyeccion(data);
    } catch (error) {
      console.warn('Usando datos de ejemplo para proyección de cobranza', error);
      return sampleCarteraData.proyeccionCobranza;
    }
  }

  async actualizarLimiteCredito(clienteId, nuevoLimite, observaciones = '') {
    try {
      const payload = {
        limite_credito: nuevoLimite,
        notas: observaciones
      };
      const { data } = await apiClient.put(`/cartera/clientes/${clienteId}/limite/`, payload);
      return {
        limiteCredito: toNumber(data.limite_credito),
        notas: data.notas || ''
      };
    } catch (error) {
      console.warn('Simulando actualización de límite de crédito', error);
      return {
        limiteCredito: nuevoLimite,
        notas: observaciones,
        simulated: true
      };
    }
  }

  async registrarGestionCobranza(clienteId, gestion) {
    try {
      const payload = {
        tipo: TIPO_TO_API[gestion.tipo] || 'otro',
        resultado: RESULTADO_TO_API[gestion.resultado] || 'otro',
        observaciones: gestion.observaciones,
        proximo_contacto: gestion.proximoContacto || null
      };
      const { data } = await apiClient.post(`/cartera/clientes/${clienteId}/gestiones/`, payload);
      return normalizeHistorial([data])[0];
    } catch (error) {
      console.warn('Simulando registro de gestión de cobranza', error);
      return {
        id: Date.now(),
        tipo: gestion.tipo,
        resultado: gestion.resultado,
        observaciones: gestion.observaciones,
        fecha: new Date().toISOString(),
        usuario: 'Equipo de cobranza',
        proximoContacto: gestion.proximoContacto || null,
        simulated: true
      };
    }
  }

  async generarReporteCartera(filtros = {}) {
    try {
      const params = new URLSearchParams(filtros);
      const { data } = await apiClient.get(`/cartera/reporte/?${params.toString()}`, {
        responseType: 'blob'
      });
      return data;
    } catch (error) {
      console.warn('Simulando generación de reporte', error);
      return new Blob(['Reporte de cartera simulado'], { type: 'application/pdf' });
    }
  }

  async enviarEstadoCuenta(clienteId, email = null) {
    try {
      const payload = {};
      if (email) {
        payload.detalle = { destinatario: email };
        payload.medio = 'email';
      }
      const { data } = await apiClient.post(`/cartera/clientes/${clienteId}/enviar-estado/`, payload);
      return {
        mensaje: 'Estado de cuenta enviado',
        detalle: data.detalle || {},
        estado: data.estado
      };
    } catch (error) {
      console.warn('Simulando envío de estado de cuenta', error);
      return {
        mensaje: 'Estado de cuenta enviado (simulado)',
        simulated: true
      };
    }
  }

  async getHistorialGestiones(clienteId) {
    try {
      const { data } = await apiClient.get(`/cartera/clientes/${clienteId}/historial-gestiones/`);
      return normalizeHistorial(data);
    } catch (error) {
      console.warn('Usando datos de ejemplo para historial de gestiones', error);
      return [
        {
          id: 1,
          fecha: '2024-10-08',
          tipo: 'Llamada telefónica',
          resultado: 'Compromiso de pago',
          observaciones: 'Cliente confirma pago para el 15 de octubre',
          usuario: 'María González'
        }
      ];
    }
  }
}

const carteraService = new CarteraService();

export default carteraService;