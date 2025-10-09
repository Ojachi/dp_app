import {
  CSidebar,
  CSidebarNav,
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import {
  cilSpreadsheet,
  cilDollar,
  cilGroup,
  cilUser,
  cilHome,
  cilCloudUpload,
} from '@coreui/icons';
import NavItem from '../components/NavItem';

const navItems = [
  { to: '/', label: 'Dashboard', icon: <CIcon icon={cilHome} /> },
  { to: '/facturas', label: 'Facturas', icon: <CIcon icon={cilSpreadsheet} /> },
  { to: '/pagos', label: 'Pagos', icon: <CIcon icon={cilDollar} /> },
  { to: '/cartera', label: 'Cartera', icon: <CIcon icon={cilGroup} /> },
  { to: '/usuarios', label: 'Usuarios', icon: <CIcon icon={cilUser} /> },
  { to: '/importacion', label: 'Importar Excel', icon: <CIcon icon={cilCloudUpload} /> },
];

const Sidebar = () => {

  return (
    <CSidebar className="border-end position-static d-flex flex-column" unfoldable>
      <CSidebarNav className="flex-grow-1">
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </CSidebarNav>
    </CSidebar>
  );
};

export default Sidebar;
