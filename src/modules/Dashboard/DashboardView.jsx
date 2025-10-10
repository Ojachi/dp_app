/**
 * Dashboard principal con vistas personalizadas por rol
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAlertas } from '../../hooks/useAlertas';
import { facturasService } from '../../services/facturasService';
import { pagosService } from '../../services/pagosService';
import DashboardGerente from './components/DashboardGerente';
import DashboardVendedor from './components/DashboardVendedor';
import DashboardDistribuidor from './components/DashboardDistribuidor';
import LoadingSpinner from '../../components/LoadingSpinner';

const DashboardView = () => {
  const { user, isGerente, isVendedor, isDistribuidor } = useAuth();
  const { contadorNuevas } = useAlertas();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos del dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data = {};

        if (isGerente()) {
          // Dashboard completo para gerentes
          const [facturasData, pagosData] = await Promise.all([
            facturasService.getDashboard(),
            pagosService.getDashboard()
          ]);
          
          data = {
            facturas: facturasData,
            pagos: pagosData,
            alertas: { nuevas: contadorNuevas }
          };
        } else {
          // Dashboard limitado para vendedores y distribuidores
          const facturas = await facturasService.getFacturas({ limit: 5 });
          
          data = {
            facturas: {
              estadisticas: {
                total_facturas: facturas.count || facturas.length,
                // Calcular estadísticas básicas
              },
              facturas_recientes: facturas.results || facturas
            },
            alertas: { nuevas: contadorNuevas }
          };
        }

        setDashboardData(data);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isGerente, contadorNuevas]);

  // Mostrar loading
  if (loading) {
    return <LoadingSpinner message="Cargando dashboard..." />;
  }

  // Mostrar error
  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  // Renderizar dashboard según el rol
  const renderDashboard = () => {
    if (isGerente()) {
      return <DashboardGerente data={dashboardData} user={user} />;
    } else if (isVendedor()) {
      return <DashboardVendedor data={dashboardData} user={user} />;
    } else if (isDistribuidor()) {
      return <DashboardDistribuidor data={dashboardData} user={user} />;
    } else {
      return (
        <div className="alert alert-warning">
          <i className="fas fa-user-times me-2"></i>
          Rol de usuario no reconocido
        </div>
      );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header del dashboard */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="fas fa-tachometer-alt me-2 text-primary"></i>
                Dashboard
              </h2>
              <p className="text-muted mb-0">
                Bienvenido, {user?.first_name || user?.username}
              </p>
            </div>
            <div className="text-end">
              <small className="text-muted d-block">
                Último acceso: {new Date().toLocaleString('es-CO')}
              </small>
              <span className={`badge ${
                isGerente() ? 'bg-success' : 
                isVendedor() ? 'bg-primary' : 'bg-info'
              }`}>
                {user?.role || user?.tipo_usuario}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido del dashboard */}
      {renderDashboard()}
    </div>
  );
};

export default DashboardView;