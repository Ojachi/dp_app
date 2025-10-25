import apiClient from './api';

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
    // Métricas por cliente
    totalFacturas: Number(entrada.total_facturas ?? 0),
    facturasActivas: Number(entrada.facturas_activas ?? 0),
    activasPendientes: Number(entrada.activas_pendientes ?? 0),
    activasParciales: Number(entrada.activas_parciales ?? 0),
    activasVencidas: Number(entrada.activas_vencidas ?? 0),
    // Compatibilidad previa: mantenemos facturasPendientes como 'activas'
    facturasPendientes: Number(entrada.facturas_activas ?? facturas.length ?? 0),
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


class CarteraService {
  async getCuentasPorCobrar(filtros = {}) {
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
  }

}

const carteraService = new CarteraService();

export default carteraService;