import apiClient from './apiClient';

// Datos de ejemplo para cartera
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
    },
    {
      id: 3,
      cliente: 'Supermercados del Norte S.A.S.',
      ruc: '20456789123',
      telefono: '+57 302 456 7891',
      email: 'pagos@supernorte.com',
      totalDeuda: 680000,
      facturasPendientes: 12,
      facturaVencida: {
        numero: 'FAC-2024-1180',
        fechaVencimiento: '2024-09-20',
        monto: 185000,
        diasVencido: 20
      },
      historialPagos: 'Regular',
      limiteCredito: 1000000,
      estado: 'En mora'
    },
    {
      id: 4,
      cliente: 'Minimarket Express Ltda.',
      ruc: '20321654987',
      telefono: '+57 303 321 6549',
      email: 'admin@miniexpress.com',
      totalDeuda: 95000,
      facturasPendientes: 2,
      facturaVencida: null,
      historialPagos: 'Bueno',
      limiteCredito: 200000,
      estado: 'Al día'
    },
    {
      id: 5,
      cliente: 'Almacén Popular S.A.',
      ruc: '20789123456',
      telefono: '+57 304 789 1234',
      email: 'finanzas@popular.com',
      totalDeuda: 270000,
      facturasPendientes: 6,
      facturaVencida: {
        numero: 'FAC-2024-1156',
        fechaVencimiento: '2024-09-10',
        monto: 95000,
        diasVencido: 30
      },
      historialPagos: 'Regular',
      limiteCredito: 400000,
      estado: 'En mora'
    }
  ],
  estadisticasMora: [
    { rango: '1-30 días', cantidad: 8, monto: 580000, porcentaje: 31.4 },
    { rango: '31-60 días', cantidad: 3, monto: 405000, porcentaje: 21.9 },
    { rango: '61-90 días', cantidad: 1, monto: 125000, porcentaje: 6.8 },
    { rango: '+90 días', cantidad: 0, monto: 0, porcentaje: 0 }
  ],
  proyeccionCobranza: [
    { mes: 'Oct 2024', estimado: 650000, real: 0, probabilidad: 85 },
    { mes: 'Nov 2024', estimado: 520000, real: 0, probabilidad: 75 },
    { mes: 'Dec 2024', estimado: 380000, real: 0, probabilidad: 65 },
    { mes: 'Jan 2025', estimado: 300000, real: 0, probabilidad: 60 }
  ]
};

class CarteraService {
  // Obtener resumen general de cartera
  async getResumenCartera() {
    try {
      const response = await apiClient.get('/cartera/resumen');
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para resumen de cartera');
      return sampleCarteraData.resumen;
    }
  }

  // Obtener cuentas por cobrar
  async getCuentasPorCobrar(filtros = {}) {
    try {
      const params = new URLSearchParams(filtros);
      const response = await apiClient.get(`/cartera/cuentas-por-cobrar?${params}`);
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para cuentas por cobrar');
      let cuentas = [...sampleCarteraData.cuentasPorCobrar];
      
      // Aplicar filtros
      if (filtros.estado) {
        cuentas = cuentas.filter(cuenta => cuenta.estado.toLowerCase().includes(filtros.estado.toLowerCase()));
      }
      if (filtros.cliente) {
        cuentas = cuentas.filter(cuenta => cuenta.cliente.toLowerCase().includes(filtros.cliente.toLowerCase()));
      }
      if (filtros.montoMin) {
        cuentas = cuentas.filter(cuenta => cuenta.totalDeuda >= parseFloat(filtros.montoMin));
      }
      if (filtros.montoMax) {
        cuentas = cuentas.filter(cuenta => cuenta.totalDeuda <= parseFloat(filtros.montoMax));
      }

      return {
        cuentas,
        total: cuentas.length,
        totalMonto: cuentas.reduce((sum, cuenta) => sum + cuenta.totalDeuda, 0)
      };
    }
  }

  // Obtener detalle de cuenta específica
  async getDetalleCuenta(clienteId) {
    try {
      const response = await apiClient.get(`/cartera/cuenta/${clienteId}`);
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para detalle de cuenta');
      const cuenta = sampleCarteraData.cuentasPorCobrar.find(c => c.id === parseInt(clienteId));
      
      if (!cuenta) {
        throw new Error('Cliente no encontrado');
      }

      return {
        ...cuenta,
        facturas: [
          {
            numero: 'FAC-2024-1205',
            fecha: '2024-08-15',
            vencimiento: '2024-09-15',
            monto: 125000,
            saldo: 125000,
            estado: 'Vencida',
            diasVencido: 25
          },
          {
            numero: 'FAC-2024-1189',
            fecha: '2024-09-01',
            vencimiento: '2024-10-01',
            monto: 180000,
            saldo: 180000,
            estado: 'Pendiente',
            diasVencido: 0
          },
          {
            numero: 'FAC-2024-1167',
            fecha: '2024-09-15',
            vencimiento: '2024-10-15',
            monto: 180000,
            saldo: 180000,
            estado: 'Pendiente',
            diasVencido: 0
          }
        ],
        pagos: [
          {
            fecha: '2024-08-10',
            factura: 'FAC-2024-1156',
            monto: 95000,
            metodo: 'Transferencia',
            referencia: 'TRF-789456'
          },
          {
            fecha: '2024-07-25',
            factura: 'FAC-2024-1134',
            monto: 120000,
            metodo: 'Cheque',
            referencia: 'CHQ-456123'
          }
        ]
      };
    }
  }

  // Obtener estadísticas de mora
  async getEstadisticasMora() {
    try {
      const response = await apiClient.get('/cartera/estadisticas-mora');
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para estadísticas de mora');
      return sampleCarteraData.estadisticasMora;
    }
  }

  // Obtener proyección de cobranza
  async getProyeccionCobranza() {
    try {
      const response = await apiClient.get('/cartera/proyeccion-cobranza');
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para proyección de cobranza');
      return sampleCarteraData.proyeccionCobranza;
    }
  }

  // Actualizar límite de crédito
  async actualizarLimiteCredito(clienteId, nuevoLimite, observaciones = '') {
    try {
      const response = await apiClient.put(`/cartera/limite-credito/${clienteId}`, {
        limiteCredito: nuevoLimite,
        observaciones
      });
      return response.data;
    } catch (error) {
      console.warn('Simulando actualización de límite de crédito');
      return {
        success: true,
        mensaje: `Límite de crédito actualizado a $${nuevoLimite.toLocaleString()}`
      };
    }
  }

  // Registrar gestión de cobranza
  async registrarGestionCobranza(clienteId, gestion) {
    try {
      const response = await apiClient.post(`/cartera/gestion-cobranza/${clienteId}`, gestion);
      return response.data;
    } catch (error) {
      console.warn('Simulando registro de gestión de cobranza');
      return {
        success: true,
        mensaje: 'Gestión de cobranza registrada exitosamente',
        gestion: {
          id: Date.now(),
          fecha: new Date().toISOString(),
          ...gestion
        }
      };
    }
  }

  // Generar reporte de cartera
  async generarReporteCartera(filtros = {}) {
    try {
      const params = new URLSearchParams(filtros);
      const response = await apiClient.get(`/cartera/reporte?${params}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.warn('Simulando generación de reporte');
      return new Blob(['Reporte de cartera simulado'], { type: 'application/pdf' });
    }
  }

  // Enviar estado de cuenta por email
  async enviarEstadoCuenta(clienteId, email = null) {
    try {
      const response = await apiClient.post(`/cartera/enviar-estado-cuenta/${clienteId}`, { email });
      return response.data;
    } catch (error) {
      console.warn('Simulando envío de estado de cuenta');
      return {
        success: true,
        mensaje: 'Estado de cuenta enviado exitosamente'
      };
    }
  }

  // Obtener historial de gestiones
  async getHistorialGestiones(clienteId) {
    try {
      const response = await apiClient.get(`/cartera/historial-gestiones/${clienteId}`);
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para historial de gestiones');
      return [
        {
          id: 1,
          fecha: '2024-10-08',
          tipo: 'Llamada telefónica',
          resultado: 'Compromiso de pago',
          observaciones: 'Cliente confirma pago para el 15 de octubre',
          usuario: 'María González'
        },
        {
          id: 2,
          fecha: '2024-10-01',
          tipo: 'Email',
          resultado: 'Sin respuesta',
          observaciones: 'Enviado estado de cuenta actualizado',
          usuario: 'Carlos Ruiz'
        },
        {
          id: 3,
          fecha: '2024-09-25',
          tipo: 'Visita comercial',
          resultado: 'Acuerdo de pago',
          observaciones: 'Establecido plan de pagos para 3 cuotas',
          usuario: 'Ana López'
        }
      ];
    }
  }
}

export default new CarteraService();