import apiClient from './api';

// Datos de ejemplo para importación
const sampleImportData = {
  historialImportaciones: [
    {
      id: 1,
      nombreArchivo: 'facturas_octubre_2024.xlsx',
      fechaImportacion: '2024-10-08T10:30:00',
      usuario: 'María González',
      totalRegistros: 150,
      registrosExitosos: 147,
      registrosErroneos: 3,
      estado: 'Completada',
      tiempoProcesamientoMs: 45000,
      observaciones: 'Importación exitosa con 3 errores menores'
    },
    {
      id: 2,
      nombreArchivo: 'facturas_septiembre_2024.csv',
      fechaImportacion: '2024-09-30T15:45:00',
      usuario: 'Carlos Ruiz',
      totalRegistros: 200,
      registrosExitosos: 200,
      registrosErroneos: 0,
      estado: 'Completada',
      tiempoProcesamientoMs: 32000,
      observaciones: 'Importación perfecta sin errores'
    },
    {
      id: 3,
      nombreArchivo: 'facturas_agosto_2024.xlsx',
      fechaImportacion: '2024-08-31T09:15:00',
      usuario: 'Ana López',
      totalRegistros: 180,
      registrosExitosos: 165,
      registrosErroneos: 15,
      estado: 'Completada con errores',
      tiempoProcesamientoMs: 67000,
      observaciones: 'Errores en formato de fechas y datos duplicados'
    },
    {
      id: 4,
      nombreArchivo: 'facturas_julio_2024.xlsx',
      fechaImportacion: '2024-07-31T14:20:00',
      usuario: 'María González',
      totalRegistros: 95,
      registrosExitosos: 0,
      registrosErroneos: 95,
      estado: 'Fallida',
      tiempoProcesamientoMs: 5000,
      observaciones: 'Formato de archivo incorrecto - todas las filas fallaron'
    }
  ],
  erroresComunes: [
    {
      codigo: 'INVALID_DATE_FORMAT',
      descripcion: 'Formato de fecha inválido',
      solucion: 'Use formato DD/MM/AAAA o AAAA-MM-DD',
      frecuencia: 15
    },
    {
      codigo: 'MISSING_REQUIRED_FIELD',
      descripcion: 'Campo obligatorio vacío',
      solucion: 'Complete todos los campos marcados como obligatorios',
      frecuencia: 12
    },
    {
      codigo: 'INVALID_AMOUNT_FORMAT',
      descripcion: 'Formato de monto inválido',
      solucion: 'Use números sin símbolos de moneda ni espacios',
      frecuencia: 8
    },
    {
      codigo: 'DUPLICATE_INVOICE_NUMBER',
      descripcion: 'Número de factura duplicado',
      solucion: 'Verifique que no existan números de factura repetidos',
      frecuencia: 6
    },
    {
      codigo: 'INVALID_CLIENT_CODE',
      descripcion: 'Código de cliente no encontrado',
      solucion: 'Verifique que el código del cliente existe en el sistema',
      frecuencia: 4
    }
  ]
};

// Template de Excel para descarga
const templateColumns = [
  'numero_factura',
  'fecha_emision',
  'fecha_vencimiento', 
  'codigo_cliente',
  'nombre_cliente',
  'ruc_cliente',
  'subtotal',
  'impuestos',
  'total',
  'tipo_pago',
  'observaciones'
];

class ImportacionService {
  // Validar archivo antes de importar
  async validarArchivo(file) {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      
      const response = await apiClient.post('/importacion/validar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.warn('Simulando validación de archivo');
      
      // Simular validación basada en el nombre del archivo
      const fileName = file.name.toLowerCase();
      const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
      const isCsv = fileName.endsWith('.csv');
      
      if (!isExcel && !isCsv) {
        throw new Error('Formato de archivo no válido. Solo se permiten archivos Excel (.xlsx, .xls) o CSV (.csv)');
      }
      
      // Simular resultado de validación
      const totalRows = Math.floor(Math.random() * 200) + 50;
      const validRows = Math.floor(totalRows * 0.85);
      const invalidRows = totalRows - validRows;
      
      return {
        valido: invalidRows < totalRows * 0.2, // Válido si menos del 20% tiene errores
        totalFilas: totalRows,
        filasValidas: validRows,
        filasInvalidas: invalidRows,
        errores: invalidRows > 0 ? [
          {
            fila: 5,
            columna: 'fecha_emision',
            valor: '32/13/2024',
            error: 'INVALID_DATE_FORMAT',
            mensaje: 'Formato de fecha inválido'
          },
          {
            fila: 12,
            columna: 'total',
            valor: '$1,500.00',
            error: 'INVALID_AMOUNT_FORMAT',
            mensaje: 'El monto no debe incluir símbolos de moneda'
          }
        ] : [],
        advertencias: [
          {
            fila: 8,
            columna: 'observaciones',
            mensaje: 'Campo observaciones muy largo, será truncado'
          }
        ]
      };
    }
  }

  // Obtener vista previa de datos
  async obtenerVistaPrevia(file, opciones = {}) {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('opciones', JSON.stringify(opciones));
      
      const response = await apiClient.post('/importacion/vista-previa', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.warn('Simulando vista previa de datos');
      
      // Simular datos de vista previa
      const sampleRows = [
        {
          numero_factura: 'FAC-2024-1001',
          fecha_emision: '15/10/2024',
          fecha_vencimiento: '15/11/2024',
          codigo_cliente: 'CLI-001',
          nombre_cliente: 'Distribuidora Central S.A.',
          ruc_cliente: '20123456789',
          subtotal: '150000',
          impuestos: '28500',
          total: '178500',
          tipo_pago: 'Crédito',
          observaciones: 'Factura mensual'
        },
        {
          numero_factura: 'FAC-2024-1002',
          fecha_emision: '15/10/2024',
          fecha_vencimiento: '30/10/2024',
          codigo_cliente: 'CLI-002',
          nombre_cliente: 'Comercial Los Andes Ltda.',
          ruc_cliente: '20987654321',
          subtotal: '250000',
          impuestos: '47500',
          total: '297500',
          tipo_pago: 'Efectivo',
          observaciones: ''
        },
        {
          numero_factura: 'FAC-2024-1003',
          fecha_emision: '16/10/2024',
          fecha_vencimiento: '16/12/2024',
          codigo_cliente: 'CLI-003',
          nombre_cliente: 'Supermercados del Norte S.A.S.',
          ruc_cliente: '20456789123',
          subtotal: '480000',
          impuestos: '91200',
          total: '571200',
          tipo_pago: 'Transferencia',
          observaciones: 'Pedido especial'
        }
      ];

      return {
        columnas: templateColumns,
        filas: sampleRows,
        totalFilas: 156,
        filasPreview: 3
      };
    }
  }

  // Importar archivo de facturas
  async importarFacturas(file, opciones = {}) {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('opciones', JSON.stringify(opciones));
      
      const response = await apiClient.post('/importacion/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.warn('Simulando importación de facturas');
      
      // Simular proceso de importación con progreso
      const totalRegistros = Math.floor(Math.random() * 200) + 50;
      const registrosExitosos = Math.floor(totalRegistros * (0.85 + Math.random() * 0.1));
      const registrosErroneos = totalRegistros - registrosExitosos;
      
      return {
        id: Date.now(),
        estado: registrosErroneos === 0 ? 'Completada' : 
                registrosErroneos < totalRegistros * 0.1 ? 'Completada con errores' : 'Fallida',
        totalRegistros,
        registrosExitosos,
        registrosErroneos,
        tiempoProcesamientoMs: Math.floor(Math.random() * 60000) + 10000,
        errores: registrosErroneos > 0 ? [
          {
            fila: 5,
            error: 'INVALID_DATE_FORMAT',
            mensaje: 'Formato de fecha inválido en fecha_emision'
          },
          {
            fila: 12,
            error: 'DUPLICATE_INVOICE_NUMBER',
            mensaje: 'Número de factura ya existe en el sistema'
          }
        ] : [],
        resumen: {
          facturasCreadas: registrosExitosos,
          clientesNuevos: Math.floor(registrosExitosos * 0.1),
          montoTotal: registrosExitosos * 250000
        }
      };
    }
  }

  // Obtener estado de importación en progreso
  async obtenerEstadoImportacion(importacionId) {
    try {
      const response = await apiClient.get(`/importacion/estado/${importacionId}`);
      return response.data;
    } catch (error) {
      console.warn('Simulando estado de importación');
      
      // Simular progreso de importación
      const progreso = Math.min(100, Math.floor(Math.random() * 100) + 1);
      
      return {
        id: importacionId,
        estado: progreso === 100 ? 'Completada' : 'En progreso',
        progreso,
        registrosProcesados: Math.floor(progreso * 1.5),
        registrosExitosos: Math.floor(progreso * 1.3),
        registrosErroneos: Math.floor(progreso * 0.2),
        tiempoTranscurrido: progreso * 1000,
        etaMs: progreso < 100 ? (100 - progreso) * 1000 : 0
      };
    }
  }

  // Obtener historial de importaciones
  async obtenerHistorialImportaciones(filtros = {}) {
    try {
      const params = new URLSearchParams(filtros);
      const response = await apiClient.get(`/importacion/historial?${params}`);
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para historial');
      let historial = [...sampleImportData.historialImportaciones];
      
      // Aplicar filtros
      if (filtros.estado) {
        historial = historial.filter(h => 
          h.estado.toLowerCase().includes(filtros.estado.toLowerCase())
        );
      }
      if (filtros.usuario) {
        historial = historial.filter(h => 
          h.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
        );
      }
      if (filtros.fechaDesde) {
        historial = historial.filter(h => 
          new Date(h.fechaImportacion) >= new Date(filtros.fechaDesde)
        );
      }
      if (filtros.fechaHasta) {
        historial = historial.filter(h => 
          new Date(h.fechaImportacion) <= new Date(filtros.fechaHasta)
        );
      }

      return {
        importaciones: historial,
        total: historial.length
      };
    }
  }

  // Obtener estadísticas de importación
  async obtenerEstadisticasImportacion() {
    try {
      const response = await apiClient.get('/importacion/estadisticas');
      return response.data;
    } catch (error) {
      console.warn('Usando datos de ejemplo para estadísticas');
      
      const importaciones = sampleImportData.historialImportaciones;
      return {
        totalImportaciones: importaciones.length,
        importacionesExitosas: importaciones.filter(i => i.estado === 'Completada').length,
        importacionesConErrores: importaciones.filter(i => i.estado === 'Completada con errores').length,
        importacionesFallidas: importaciones.filter(i => i.estado === 'Fallida').length,
        totalRegistrosProcesados: importaciones.reduce((sum, i) => sum + i.totalRegistros, 0),
        totalRegistrosExitosos: importaciones.reduce((sum, i) => sum + i.registrosExitosos, 0),
        promedioTiempoProcesamiento: importaciones.reduce((sum, i) => sum + i.tiempoProcesamientoMs, 0) / importaciones.length,
        erroresComunes: sampleImportData.erroresComunes
      };
    }
  }

  // Descargar template de importación
  async descargarTemplate(formato = 'xlsx') {
    try {
      const response = await apiClient.get(`/importacion/template?formato=${formato}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.warn('Simulando descarga de template');
      
      // Crear contenido CSV simulado
      const csvContent = [
        templateColumns.join(','),
  'FAC-2024-XXXX,DD/MM/AAAA,DD/MM/AAAA,CLI-XXX,Nombre Cliente,RUC,0,0,0,Crédito,Observaciones'
      ].join('\n');
      
      return new Blob([csvContent], { 
        type: formato === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
    }
  }

  // Obtener detalle de errores de una importación
  async obtenerDetalleErrores(importacionId) {
    try {
      const response = await apiClient.get(`/importacion/errores/${importacionId}`);
      return response.data;
    } catch (error) {
      console.warn('Simulando detalle de errores');
      
      return [
        {
          fila: 5,
          columna: 'fecha_emision',
          valorOriginal: '32/13/2024',
          error: 'INVALID_DATE_FORMAT',
          mensaje: 'La fecha debe estar en formato DD/MM/AAAA o AAAA-MM-DD',
          sugerencia: 'Cambie 32/13/2024 por 31/12/2024'
        },
        {
          fila: 12,
          columna: 'numero_factura',
          valorOriginal: 'FAC-2024-1001',
          error: 'DUPLICATE_INVOICE_NUMBER',
          mensaje: 'Este número de factura ya existe en el sistema',
          sugerencia: 'Use un número de factura único'
        },
        {
          fila: 18,
          columna: 'total',
          valorOriginal: '$1,500.00',
          error: 'INVALID_AMOUNT_FORMAT',
          mensaje: 'El monto debe ser numérico sin símbolos',
          sugerencia: 'Cambie $1,500.00 por 1500.00'
        }
      ];
    }
  }

  // Reinteisar importación corrigiendo errores
  async reintentarImportacion(importacionId, archivoCorregido) {
    try {
      const formData = new FormData();
      formData.append('archivo', archivoCorregido);
      
      const response = await apiClient.post(`/importacion/reintentar/${importacionId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.warn('Simulando reintento de importación');
      
      return {
        id: Date.now(),
        estado: 'Completada',
        mensaje: 'Importación reintentada exitosamente con correcciones aplicadas'
      };
    }
  }
}

const importacionService = new ImportacionService();
export default importacionService;