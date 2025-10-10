# 🚀 Sistema de Gestión de Distribución

[![React](https://img.shields.io/badge/React-18.0-blue?logo=react)](https://reactjs.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.0-purple?logo=bootstrap)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Sistema integral de gestión empresarial** desarrollado en React con componentes avanzados y análisis financiero completo.

## ✨ Características Principales

- 📊 **Dashboard Ejecutivo** con métricas en tiempo real
- 👥 **Gestión de Usuarios** con roles y permisos
- 🧾 **Administración de Facturas** completa
- 💰 **Control de Pagos** con múltiples métodos
- 📈 **Análisis de Cartera** y proyecciones financieras  
- 📤 **Importación Excel** con validación automática
- 🎨 **Componentes UI** reutilizables y responsivos

## 🎯 Demo Rápido

```bash
# Instalación rápida
npm install && npm start
```

Abre [http://localhost:3000](http://localhost:3000) para ver el sistema en acción.

## 📦 Instalación Completa

### Prerrequisitos
- **Node.js** 16 o superior
- **npm** o **yarn**

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/dp_app.git
cd dp_app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
cp .env.example .env

# 4. Iniciar en modo desarrollo
npm start
```

## 🛠️ Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm test` | Ejecuta los tests en modo watch |
| `npm run build` | Construye la app para producción |
| `npm run eject` | Expone configuración de CRA |

## 🏗️ Arquitectura del Proyecto

```
dp_app/
├── 📁 src/
│   ├── 🧩 components/     # Componentes UI reutilizables
│   ├── 📱 modules/        # Módulos de funcionalidad
│   ├── 🔗 services/       # Servicios API
│   ├── 🪝 hooks/          # Custom React Hooks
│   ├── 🎨 layouts/        # Layouts de página
│   └── 🛣️ routes/         # Configuración de rutas
├── 📁 public/             # Archivos estáticos
└── 📄 docs/               # Documentación técnica
```

## 🎨 Componentes Destacados

### 📋 Table Avanzado
```javascript
import { Table } from './components';

<Table 
  data={usuarios}
  columns={columns}
  sortable
  selectable
  onSort={handleSort}
  onSelect={handleSelect}
/>
```

### 🔄 LoadingSpinner
```javascript
import { LoadingSpinner, PageLoader } from './components';

<LoadingSpinner size="lg" variant="primary" />
<PageLoader text="Cargando dashboard..." />
```

### 🎯 Modal Mejorado
```javascript
import { Modal, useModal } from './components';

const { isOpen, openModal, closeModal } = useModal();
```

## 📊 Módulos del Sistema

### 1. 🏠 Dashboard
- KPIs principales del negocio
- Gráficos interactivos de ventas
- Alertas y notificaciones importantes

### 2. 👤 Usuarios  
- CRUD completo de usuarios
- Sistema de roles y permisos
- Perfiles personalizables

### 3. 📄 Facturas
- Creación y edición de facturas
- Estados y seguimiento
- Reportes automatizados

### 4. 💳 Pagos
- Gestión de múltiples métodos de pago
- Conciliación automática
- Historial detallado

### 5. 💼 Cartera
- Análisis de cuentas por cobrar
- Métricas de mora por cliente
- Proyecciones de flujo de caja

### 6. 📁 Importación
- Carga masiva desde Excel/CSV
- Validación automática de datos
- Procesamiento en segundo plano

## 🚀 Características Técnicas

### ⚡ Rendimiento
- **Code splitting** automático
- **Lazy loading** de rutas
- **Memoización** inteligente
- **Bundle size** optimizado

### 🎨 UX/UI
- **Responsive design** completo
- **Dark/Light mode** (próximamente)
- **Accesibilidad** WCAG 2.1
- **Animaciones** fluidas

### 🔒 Seguridad  
- **Validación** client-side y server-side
- **Sanitización** de inputs
- **JWT** para autenticación
- **CORS** configurado

## 📈 Roadmap

### 🎯 v1.1 (Próximo)
- [ ] Sistema de notificaciones push
- [ ] Reportes PDF automáticos  
- [ ] API REST completa
- [ ] Modo offline básico

### 🚀 v1.2 (Futuro)
- [ ] Dashboard personalizable
- [ ] Integración contable
- [ ] App móvil nativa
- [ ] BI y analytics avanzado

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el proyecto
2. **Crea** tu rama (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### 📋 Estándares de Código
- **ESLint** + **Prettier** configurados
- **Commits** descriptivos y claros
- **Tests** para nuevas funcionalidades
- **Documentación** actualizada

## 📚 Documentación

- 📖 [Documentación Técnica Completa](./DOCUMENTATION.md)
- 🎨 [Guía de Componentes](./docs/components.md)
- 🔧 [API Reference](./docs/api.md)
- 🚀 [Guía de Despliegue](./docs/deployment.md)

## 🐛 Reporte de Bugs

¿Encontraste un problema? [Abre un issue](https://github.com/usuario/dp_app/issues) con:
- Descripción del problema
- Pasos para reproducir
- Captura de pantalla (si aplica)
- Información del navegador/OS

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
