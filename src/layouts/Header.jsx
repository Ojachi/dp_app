import React from 'react';
import { CHeader, CHeaderBrand, CHeaderNav } from '@coreui/react';

const Header = () => (
  <CHeader position="sticky" className=" app-header">
    <CHeaderBrand>
      <span className="fs-4 fw-bold">DP APP</span>
    </CHeaderBrand>
    <CHeaderNav className="ms-auto">
      {/* Aquí irán iconos de usuario, notificaciones, logout, etc. */}
      <span className="me-3">Bienvenido (NOMBRE)</span>
    </CHeaderNav>
  </CHeader>
);

export default Header;
