import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardView from '../modules/Dashboard/DashboardView';
import FacturasView from '../modules/Facturas/FacturasView';
import PagosView from '../modules/Pagos/PagosView';
import CarteraView from '../modules/Cartera/CarteraView';
import UsuariosView from '../modules/Usuarios/UsuariosView';
import ImportacionView from '../modules/Importacion/ImportacionView';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<DashboardView />} />
    <Route path="/facturas" element={<FacturasView />} />
    <Route path="/pagos" element={<PagosView />} />
    <Route path="/cartera" element={<CarteraView />} />
    <Route path="/usuarios" element={<UsuariosView />} />
    <Route path="/importacion" element={<ImportacionView />} />
    <Route path="*" element={<p>404 - No encontrado</p>} />
  </Routes>
);

export default AppRoutes;
