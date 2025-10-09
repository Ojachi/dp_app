import React from 'react';
import { NavLink } from 'react-router-dom';
import { CNavItem } from '@coreui/react';

const NavItem = ({ to, label, icon }) => (
  <CNavItem component={NavLink} href={to} activeClassName="active" allowFullScreen>
    {icon && <span className="nav-icon">{icon}</span>} {label}
  </CNavItem>
);

export default NavItem;
