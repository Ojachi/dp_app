/**
 * Componente principal de la aplicación
 */
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AppRoutes from './routes/AppRoutes';
import './styles/layout.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
