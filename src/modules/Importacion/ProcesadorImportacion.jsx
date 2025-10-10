import React, { useState, useRef } from 'react';
import Modal from '../../components/Modal';

const ProcesadorImportacion = ({
  archivoSeleccionado,
  validacionResultado,
  vistaPrevia,
  resultadoImportacion,
  validaciones,
  loading,
  seleccionarArchivo,
  obtenerVistaPrevia,
  ejecutarImportacion,
  limpiarImportacionActual
}) => {
  const [step, setStep] = useState(1); // 1: Selección, 2: Validación, 3: Vista Previa, 4: Resultado
  const [showModalVistaPrevia, setShowModalVistaPrevia] = useState(false);
  const [showModalResultado, setShowModalResultado] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await seleccionarArchivo(file);
      setStep(2);
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
    }
  };

  const handleDropFile = async (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      try {
        await seleccionarArchivo(file);
        setStep(2);
      } catch (error) {
        console.error('Error al procesar archivo:', error);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleContinueToPreview = async () => {
    try {
      await obtenerVistaPrevia();
      setStep(3);
    } catch (error) {
      console.error('Error al obtener vista previa:', error);
    }
  };

  const handleExecuteImport = async () => {
    try {
      const resultado = await ejecutarImportacion();
      setStep(4);
      setShowModalResultado(true);
      return resultado;
    } catch (error) {
      console.error('Error en importación:', error);
    }
  };

  const handleStartNew = () => {
    limpiarImportacionActual();
    setStep(1);
    setShowModalVistaPrevia(false);
    setShowModalResultado(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="row">
      {/* Progreso del proceso */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Proceso de Importación</h6>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleStartNew}
              >
                <i className="fas fa-plus me-1"></i>
                Nueva Importación
              </button>
            </div>
            
            {/* Barra de progreso por pasos */}
            <div className="progress mb-3" style={{ height: '8px' }}>
              <div 
                className="progress-bar bg-success"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>

            <div className="row text-center">
              <div className="col-3">
                <div className={`text-${step >= 1 ? 'success' : 'muted'}`}>
                  <i className={`fas fa-file-upload fa-2x mb-2 ${step === 1 ? 'text-primary' : ''}`}></i>
                  <div className="small fw-semibold">1. Seleccionar Archivo</div>
                </div>
              </div>
              <div className="col-3">
                <div className={`text-${step >= 2 ? 'success' : 'muted'}`}>
                  <i className={`fas fa-check-circle fa-2x mb-2 ${step === 2 ? 'text-primary' : ''}`}></i>
                  <div className="small fw-semibold">2. Validación</div>
                </div>
              </div>
              <div className="col-3">
                <div className={`text-${step >= 3 ? 'success' : 'muted'}`}>
                  <i className={`fas fa-eye fa-2x mb-2 ${step === 3 ? 'text-primary' : ''}`}></i>
                  <div className="small fw-semibold">3. Vista Previa</div>
                </div>
              </div>
              <div className="col-3">
                <div className={`text-${step >= 4 ? 'success' : 'muted'}`}>
                  <i className={`fas fa-flag-checkered fa-2x mb-2 ${step === 4 ? 'text-primary' : ''}`}></i>
                  <div className="small fw-semibold">4. Resultado</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paso 1: Selección de archivo */}
      {step === 1 && (
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-file-upload text-primary me-2"></i>
                Seleccionar Archivo para Importar
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-lg-8">
                  {/* Zona de arrastrar y soltar */}
                  <div
                    className="border-dashed border-2 border-primary rounded p-5 text-center mb-3"
                    onDrop={handleDropFile}
                    onDragOver={handleDragOver}
                    style={{ 
                      backgroundColor: '#f8f9fa',
                      borderStyle: 'dashed',
                      cursor: 'pointer'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <i className="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                    <h5>Arrastra tu archivo aquí</h5>
                    <p className="text-muted mb-3">
                      o haz clic para seleccionar desde tu computador
                    </p>
                    <button className="btn btn-primary">
                      <i className="fas fa-folder-open me-1"></i>
                      Seleccionar Archivo
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {/* Información del archivo seleccionado */}
                  {archivoSeleccionado && (
                    <div className="alert alert-info" role="alert">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-file-excel fa-2x text-success me-3"></i>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{archivoSeleccionado.name}</h6>
                          <small>
                            Tamaño: {formatFileSize(archivoSeleccionado.size)} | 
                            Tipo: {archivoSeleccionado.type || 'Desconocido'} |
                            Última modificación: {new Date(archivoSeleccionado.lastModified).toLocaleDateString()}
                          </small>
                        </div>
                        {loading && (
                          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-lg-4">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-info-circle text-info me-2"></i>
                        Formatos Soportados
                      </h6>
                      <ul className="list-unstyled mb-3">
                        <li><i className="fas fa-file-excel text-success me-2"></i>Excel (.xlsx, .xls)</li>
                        <li><i className="fas fa-file-csv text-primary me-2"></i>CSV (.csv)</li>
                      </ul>
                      
                      <h6 className="card-title">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        Requisitos
                      </h6>
                      <ul className="small text-muted mb-0">
                        <li>Tamaño máximo: 10 MB</li>
                        <li>Máximo 5,000 registros</li>
                        <li>Encoding UTF-8 recomendado</li>
                        <li>Primera fila debe contener encabezados</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 2: Validación */}
      {step === 2 && validacionResultado && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-check-circle text-success me-2"></i>
                Resultado de Validación
              </h5>
              <span className={`badge ${validacionResultado.valido ? 'bg-success' : 'bg-danger'}`}>
                {validacionResultado.valido ? 'Archivo Válido' : 'Errores Encontrados'}
              </span>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-3 text-center">
                  <div className="h3 text-primary">{validacionResultado.totalFilas}</div>
                  <small className="text-muted">Total Filas</small>
                </div>
                <div className="col-md-3 text-center">
                  <div className="h3 text-success">{validacionResultado.filasValidas}</div>
                  <small className="text-muted">Filas Válidas</small>
                </div>
                <div className="col-md-3 text-center">
                  <div className="h3 text-danger">{validacionResultado.filasInvalidas}</div>
                  <small className="text-muted">Filas con Errores</small>
                </div>
                <div className="col-md-3 text-center">
                  <div className="h3 text-info">
                    {((validacionResultado.filasValidas / validacionResultado.totalFilas) * 100).toFixed(1)}%
                  </div>
                  <small className="text-muted">Tasa de Éxito</small>
                </div>
              </div>

              {/* Errores encontrados */}
              {validacionResultado.errores?.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Errores Encontrados ({validacionResultado.errores.length})
                  </h6>
                  <div className="table-responsive">
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>Fila</th>
                          <th>Columna</th>
                          <th>Valor</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validacionResultado.errores.slice(0, 5).map((error, index) => (
                          <tr key={index}>
                            <td>{error.fila}</td>
                            <td><code>{error.columna}</code></td>
                            <td><code>{error.valor}</code></td>
                            <td className="text-danger">{error.mensaje}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validacionResultado.errores.length > 5 && (
                      <small className="text-muted">
                        Y {validacionResultado.errores.length - 5} errores más...
                      </small>
                    )}
                  </div>
                </div>
              )}

              {/* Advertencias */}
              {validacionResultado.advertencias?.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-warning">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    Advertencias ({validacionResultado.advertencias.length})
                  </h6>
                  {validacionResultado.advertencias.slice(0, 3).map((advertencia, index) => (
                    <div key={index} className="alert alert-warning alert-sm" role="alert">
                      <small>
                        <strong>Fila {advertencia.fila}:</strong> {advertencia.mensaje}
                      </small>
                    </div>
                  ))}
                </div>
              )}

              {/* Acciones */}
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
                  onClick={handleStartNew}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Seleccionar Otro Archivo
                </button>
                
                {validacionResultado.valido && (
                  <button
                    className="btn btn-primary"
                    onClick={handleContinueToPreview}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Cargando Vista Previa...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-eye me-1"></i>
                        Continuar a Vista Previa
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Vista Previa */}
      {step === 3 && vistaPrevia && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-eye text-info me-2"></i>
                Vista Previa de Datos
              </h5>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={() => setShowModalVistaPrevia(true)}
                >
                  <i className="fas fa-expand me-1"></i>
                  Ver Completo
                </button>
                <span className="badge bg-info">
                  {vistaPrevia.totalFilas} registros total
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive mb-3">
                <table className="table table-sm table-hover">
                  <thead className="table-light">
                    <tr>
                      {vistaPrevia.columnas?.map((columna, index) => (
                        <th key={index} className="text-nowrap">
                          <small>{columna}</small>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vistaPrevia.filas?.slice(0, 3).map((fila, index) => (
                      <tr key={index}>
                        {vistaPrevia.columnas?.map((columna, colIndex) => (
                          <td key={colIndex}>
                            <small>{fila[columna] || '-'}</small>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="alert alert-info" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Mostrando las primeras 3 filas de {vistaPrevia.totalFilas} registros.</strong>
                <br />
                <small>
                  Revise que los datos se vean correctos antes de proceder con la importación.
                </small>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                >
                  <i className="fas fa-arrow-left me-1"></i>
                  Volver a Validación
                </button>
                
                <button
                  className="btn btn-success"
                  onClick={handleExecuteImport}
                  disabled={loading || !validaciones.puedeIniciarImportacion}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-1"></i>
                      Ejecutar Importación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paso 4: Resultado */}
      {step === 4 && resultadoImportacion && (
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className={`fas ${
                  resultadoImportacion.estado === 'Completada' ? 'fa-check-circle text-success' :
                  resultadoImportacion.estado === 'Completada con errores' ? 'fa-exclamation-triangle text-warning' :
                  'fa-times-circle text-danger'
                } me-2`}></i>
                Resultado de Importación
              </h5>
              <span className={`badge ${
                resultadoImportacion.estado === 'Completada' ? 'bg-success' :
                resultadoImportacion.estado === 'Completada con errores' ? 'bg-warning' :
                'bg-danger'
              }`}>
                {resultadoImportacion.estado}
              </span>
            </div>
            <div className="card-body">
              <div className="row mb-4 text-center">
                <div className="col-md-3">
                  <div className="h3 text-primary">{resultadoImportacion.totalRegistros}</div>
                  <small className="text-muted">Total Procesados</small>
                </div>
                <div className="col-md-3">
                  <div className="h3 text-success">{resultadoImportacion.registrosExitosos}</div>
                  <small className="text-muted">Registros Exitosos</small>
                </div>
                <div className="col-md-3">
                  <div className="h3 text-danger">{resultadoImportacion.registrosErroneos}</div>
                  <small className="text-muted">Registros con Error</small>
                </div>
                <div className="col-md-3">
                  <div className="h3 text-info">
                    {Math.floor(resultadoImportacion.tiempoProcesamientoMs / 1000)}s
                  </div>
                  <small className="text-muted">Tiempo de Proceso</small>
                </div>
              </div>

              {/* Resumen de creación */}
              {resultadoImportacion.resumen && (
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-file-invoice text-success fa-2x me-3"></i>
                      <div>
                        <div className="fw-semibold">{resultadoImportacion.resumen.facturasCreadas}</div>
                        <small className="text-muted">Facturas Creadas</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-users text-primary fa-2x me-3"></i>
                      <div>
                        <div className="fw-semibold">{resultadoImportacion.resumen.clientesNuevos}</div>
                        <small className="text-muted">Clientes Nuevos</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-dollar-sign text-info fa-2x me-3"></i>
                      <div>
                        <div className="fw-semibold">{formatCurrency(resultadoImportacion.resumen.montoTotal)}</div>
                        <small className="text-muted">Monto Total</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-primary"
                  onClick={handleStartNew}
                >
                  <i className="fas fa-plus me-1"></i>
                  Nueva Importación
                </button>
                
                <button
                  className="btn btn-outline-info"
                  onClick={() => setShowModalResultado(true)}
                >
                  <i className="fas fa-info-circle me-1"></i>
                  Ver Detalles Completos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa completa */}
      <Modal
        isOpen={showModalVistaPrevia}
        onClose={() => setShowModalVistaPrevia(false)}
        title="Vista Previa Completa de Datos"
        size="xl"
      >
        {vistaPrevia && (
          <div className="table-responsive" style={{ maxHeight: '500px' }}>
            <table className="table table-sm table-striped">
              <thead className="table-dark sticky-top">
                <tr>
                  <th>#</th>
                  {vistaPrevia.columnas?.map((columna, index) => (
                    <th key={index} className="text-nowrap">{columna}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vistaPrevia.filas?.map((fila, index) => (
                  <tr key={index}>
                    <td className="text-muted">{index + 1}</td>
                    {vistaPrevia.columnas?.map((columna, colIndex) => (
                      <td key={colIndex} className="text-nowrap">
                        {fila[columna] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Modal de resultado detallado */}
      <Modal
        isOpen={showModalResultado}
        onClose={() => setShowModalResultado(false)}
        title="Resultado Detallado de Importación"
        size="lg"
      >
        {resultadoImportacion && (
          <div>
            <div className="alert alert-success" role="alert">
              <h6 className="alert-heading">Importación Finalizada</h6>
              <p>La importación se completó con el siguiente resultado:</p>
              <hr />
              <div className="row">
                <div className="col-6">
                  <strong>Total procesados:</strong> {resultadoImportacion.totalRegistros}
                </div>
                <div className="col-6">
                  <strong>Exitosos:</strong> {resultadoImportacion.registrosExitosos}
                </div>
              </div>
            </div>

            {resultadoImportacion.errores?.length > 0 && (
              <div>
                <h6 className="text-danger">Errores Encontrados:</h6>
                <ul className="list-group">
                  {resultadoImportacion.errores.map((error, index) => (
                    <li key={index} className="list-group-item list-group-item-danger">
                      <strong>Fila {error.fila}:</strong> {error.mensaje}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProcesadorImportacion;