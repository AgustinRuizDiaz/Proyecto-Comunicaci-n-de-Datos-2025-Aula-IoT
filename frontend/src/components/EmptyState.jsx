import React from 'react';
import { getShadowClasses } from '../utils/theme';

// Iconos SVG para diferentes estados vacíos
const EmptyStateIcons = {
  // Aula vacía
  classroom: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),

  // Sensor vacío
  sensor: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),

  // Usuario vacío
  users: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),

  // Historial vacío
  history: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),

  // Archivo vacío
  document: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),

  // Búsqueda vacía
  search: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),

  // Error genérico
  error: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),

  // Sin conexión
  offline: () => (
    <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M18.364 5.636l-12.728 12.728M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
    </svg>
  )
};

// Componente principal de Empty State
export const EmptyState = ({
  icon = 'error',
  title = 'No hay datos disponibles',
  description = 'No se encontraron elementos para mostrar.',
  action = null,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      container: 'text-center py-8 px-4',
      icon: 'w-12 h-12 mb-3',
      title: 'text-lg font-medium',
      description: 'text-sm text-slate-500',
      action: 'mt-4'
    },
    md: {
      container: 'text-center py-12 px-6',
      icon: 'w-16 h-16 mb-4',
      title: 'text-xl font-semibold',
      description: 'text-base text-slate-500',
      action: 'mt-6'
    },
    lg: {
      container: 'text-center py-16 px-8',
      icon: 'w-20 h-20 mb-6',
      title: 'text-2xl font-bold',
      description: 'text-lg text-slate-500',
      action: 'mt-8'
    }
  };

  const IconComponent = EmptyStateIcons[icon] || EmptyStateIcons.error;

  return (
    <div className={`${sizeClasses[size].container} ${className}`}>
      <IconComponent className={sizeClasses[size].icon} />
      <h3 className={`${sizeClasses[size].title} text-slate-900 mb-2`}>
        {title}
      </h3>
      <p className={sizeClasses[size].description}>
        {description}
      </p>
      {action && (
        <div className={sizeClasses[size].action}>
          {action}
        </div>
      )}
    </div>
  );
};

// Estados vacíos específicos con textos predefinidos
export const EmptyClassrooms = ({ action, className }) => (
  <EmptyState
    icon="classroom"
    title="No hay aulas registradas"
    description="Agrega tu primera aula para comenzar a monitorear sensores y gestionar el espacio."
    action={action}
    className={className}
  />
);

export const EmptySensors = ({ action, className }) => (
  <EmptyState
    icon="sensor"
    title="No hay sensores configurados"
    description="Los sensores permiten monitorear el estado de las aulas en tiempo real."
    action={action}
    className={className}
  />
);

export const EmptyUsers = ({ action, className }) => (
  <EmptyState
    icon="users"
    title="No hay usuarios registrados"
    description="Agrega usuarios para que puedan acceder y gestionar el sistema de aulas."
    action={action}
    className={className}
  />
);

export const EmptyHistory = ({ action, className }) => (
  <EmptyState
    icon="history"
    title="No hay registros históricos"
    description="Los registros de cambios y eventos aparecerán aquí una vez que comience la actividad."
    action={action}
    className={className}
  />
);

export const EmptySearch = ({ searchTerm, className }) => (
  <EmptyState
    icon="search"
    title={`No se encontraron resultados para "${searchTerm}"`}
    description="Intenta con otros términos de búsqueda o verifica la ortografía."
    className={className}
  />
);

export const EmptyConnection = ({ className }) => (
  <EmptyState
    icon="offline"
    title="Sin conexión"
    description="Verifica tu conexión a internet e intenta nuevamente."
    className={className}
  />
);

export default EmptyState;
