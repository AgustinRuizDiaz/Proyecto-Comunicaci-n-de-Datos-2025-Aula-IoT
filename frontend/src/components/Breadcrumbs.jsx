import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Icono de casa para el inicio
const HomeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

// Icono de flecha derecha
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Componente individual de migaja
const BreadcrumbItem = ({
  href,
  label,
  icon,
  isActive = false,
  isHome = false
}) => {
  const baseClasses = "inline-flex items-center text-sm font-medium transition-colors duration-200";

  if (isActive) {
    return (
      <span className={`${baseClasses} text-slate-900`}>
        {icon && <span className="mr-1">{icon}</span>}
        <span className="truncate max-w-[120px]">{label}</span>
      </span>
    );
  }

  return (
    <Link
      to={href}
      className={`${baseClasses} text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-1 py-0.5`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      <span className="truncate max-w-[120px]">{label}</span>
    </Link>
  );
};

// Componente principal de Breadcrumbs
export const Breadcrumbs = ({
  items = [],
  className = '',
  showHome = true,
  homeLabel = 'Inicio',
  homeHref = '/',
  separator = '/',
  maxItems = 5
}) => {
  const location = useLocation();

  // Generar elementos automáticamente basados en la ruta actual
  const generateFromPath = () => {
    const pathnames = location.pathname.split('/').filter(x => x);

    const breadcrumbItems = [];

    // Agregar home si está habilitado
    if (showHome) {
      breadcrumbItems.push({
        label: homeLabel,
        href: homeHref,
        icon: <HomeIcon />,
        isHome: true
      });
    }

    // Generar migajas de la ruta actual
    pathnames.forEach((name, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;

      // Convertir nombres de ruta a etiquetas legibles
      const label = name.charAt(0).toUpperCase() + name.slice(1);

      breadcrumbItems.push({
        label,
        href,
        isActive: isLast
      });
    });

    return breadcrumbItems;
  };

  // Usar elementos personalizados o generar automáticamente
  const breadcrumbItems = items.length > 0 ? items : generateFromPath();

  // Limitar número de elementos si es necesario
  const displayedItems = breadcrumbItems.length > maxItems
    ? [
        ...breadcrumbItems.slice(0, 1),
        { label: '...', href: null, isEllipsis: true },
        ...breadcrumbItems.slice(-2)
      ]
    : breadcrumbItems;

  if (breadcrumbItems.length <= 1) {
    return null; // No mostrar breadcrumbs si solo hay un elemento
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {displayedItems.map((item, index) => {
          const isLast = index === displayedItems.length - 1;

          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <span className="mx-2 text-slate-400">
                  {typeof separator === 'string' ? separator : <ChevronRightIcon />}
                </span>
              )}

              {item.isEllipsis ? (
                <span className="text-slate-400 text-sm">...</span>
              ) : (
                <BreadcrumbItem
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isLast}
                  isHome={item.isHome}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Hook para generar breadcrumbs programáticamente
export const useBreadcrumbs = () => {
  const location = useLocation();

  const generateBreadcrumbs = (customItems = []) => {
    if (customItems.length > 0) {
      return customItems;
    }

    const pathnames = location.pathname.split('/').filter(x => x);

    return pathnames.map((name, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = name.charAt(0).toUpperCase() + name.slice(1);

      return {
        label,
        href,
        isActive: index === pathnames.length - 1
      };
    });
  };

  return { generateBreadcrumbs, currentPath: location.pathname };
};

// Configuración de etiquetas por defecto para rutas comunes
export const defaultBreadcrumbLabels = {
  '/': 'Inicio',
  '/dashboard': 'Dashboard',
  '/classrooms': 'Aulas',
  '/sensors': 'Sensores',
  '/history': 'Historial',
  '/admin': 'Administración',
  '/admin/users': 'Usuarios',
  '/admin/dashboard': 'Panel Admin',
  '/operator': 'Operario',
  '/operator/dashboard': 'Panel Operario',
  '/operator/sensors': 'Mis Sensores',
  '/login': 'Iniciar Sesión',
  '/unauthorized': 'Acceso Denegado',
};

export default Breadcrumbs;
