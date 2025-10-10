import React, { useState, useEffect } from 'react';
import { useImportacion } from '../../hooks/useImportacion';
import ProcesadorImportacion from './ProcesadorImportacion';
import HistorialImportaciones from './HistorialImportaciones';
import EstadisticasImportacion from './EstadisticasImportacion';

const ImportacionView = () => {
  const [activeTab, setActiveTab] = useState('importar');
  const importacion = useImportacion();

  // Cargar datos iniciales
  useEffect(() => {
    if (activeTab === 'historial') {
      importacion.cargarHistorial();
    } else if (activeTab === 'estadisticas') {
      importacion.cargarEstadisticas();
    }
  }, [activeTab, importacion]);

  const renderContent = () => {
    switch (activeTab) {
      case 'importar':
        return <ProcesadorImportacion {...importacion} />;
      case 'historial':
        return <HistorialImportaciones {...importacion} />;
      case 'estadisticas':
        return <EstadisticasImportacion {...importacion} />;
      default:
        return <ProcesadorImportacion {...importacion} />;
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h3 mb-0">
            <i className="fas fa-file-upload text-success me-2"></i>
            Importación de Facturas
          </h2>
          <p className="text-muted mb-0">
            Carga masiva de facturas desde archivos Excel o CSV
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success"
            onClick={() => importacion.descargarTemplate('xlsx')}
            disabled={importacion.loading}
          >
            <i className="fas fa-download me-1"></i>
            Template Excel
          </button>
          <button
            className="btn btn-outline-info"
            onClick={() => importacion.descargarTemplate('csv')}
            disabled={importacion.loading}
          >
            <i className="fas fa-download me-1"></i>
            Template CSV
          </button>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'importar' ? 'active' : ''}`}
            onClick={() => setActiveTab('importar')}
          >
            <i className="fas fa-upload me-1"></i>
            Importar Archivo
            {importacion.metricas.procesoEnCurso && (
              <span className="badge bg-warning ms-2">En Proceso</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveTab('historial')}
          >
            <i className="fas fa-history me-1"></i>
            Historial
            <span className="badge bg-secondary ms-2">
              {importacion.metricas.totalImportaciones}
            </span>
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'estadisticas' ? 'active' : ''}`}
            onClick={() => setActiveTab('estadisticas')}
          >
            <i className="fas fa-chart-bar me-1"></i>
            Estadísticas
          </button>
        </li>
      </ul>

      {/* Alertas de error */}
      {importacion.error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {importacion.error}
          <button
            type="button"
            className="btn-close"
            onClick={importacion.limpiarError}
          ></button>
        </div>
      )}

      {/* Indicador de proceso en curso */}
      {importacion.metricas.procesoEnCurso && (
        <div className="alert alert-warning" role="alert">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm text-warning me-3" role="status"></div>
            <div className="flex-grow-1">
              <h6 className="alert-heading mb-1">
                <i className="fas fa-cog me-2"></i>
                Importación en Progreso
              </h6>
              <div className="progress mb-2" style={{ height: '8px' }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
                  style={{ width: `${importacion.metricas.progreso}%` }}
                ></div>
              </div>
              <small>
                Progreso: {importacion.metricas.progreso}% - 
                ETA: {Math.ceil(importacion.metricas.eta / 1000)} segundos
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {renderContent()}
    </div>
  );
};

export default ImportacionView;