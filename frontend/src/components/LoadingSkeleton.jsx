import React from 'react';
import { getShadowClasses } from '../utils/theme';

// Componente base de skeleton
const Skeleton = ({ className = '', animated = true, ...props }) => {
  const baseClasses = `bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 ${getShadowClasses('sm')} rounded-md`;
  const animationClasses = animated ? 'animate-pulse' : '';

  return (
    <div
      className={`${baseClasses} ${animationClasses} ${className}`}
      {...props}
    />
  );
};

// Skeleton para texto
export const SkeletonText = ({
  lines = 1,
  className = '',
  width = 'w-full',
  height = 'h-4',
  spacing = 'mb-2'
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={`${width} ${height} ${i === lines - 1 ? '' : spacing}`}
          style={{
            width: i === lines - 1 ? '75%' : '100%', // Última línea más corta
          }}
        />
      ))}
    </div>
  );
};

// Skeleton para títulos
export const SkeletonTitle = ({
  className = '',
  width = 'w-3/4',
  size = 'lg'
}) => {
  const sizeClasses = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10',
  };

  return (
    <Skeleton
      className={`${width} ${sizeClasses[size]} ${className}`}
    />
  );
};

// Skeleton para avatares/círculos
export const SkeletonAvatar = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <Skeleton
      className={`rounded-full ${sizeClasses[size]} ${className}`}
    />
  );
};

// Skeleton para tarjetas
export const SkeletonCard = ({
  className = '',
  children,
  hasImage = false,
  hasAvatar = false,
  lines = 3
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 ${getShadowClasses('sm')} ${className}`}>
      {/* Header con avatar o imagen */}
      <div className="flex items-center space-x-4 mb-4">
        {hasAvatar && <SkeletonAvatar size="md" />}
        {hasImage && (
          <div className="flex-1">
            <Skeleton className="w-full h-32 rounded-md" />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="space-y-3">
        <SkeletonTitle width="w-3/4" />
        <SkeletonText lines={lines} />
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-16 h-8" />
      </div>

      {children}
    </div>
  );
};

// Skeleton para listas/tablas
export const SkeletonList = ({
  items = 5,
  className = '',
  renderItem
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i}>
          {renderItem ? renderItem(i) : <SkeletonCard />}
        </div>
      ))}
    </div>
  );
};

// Skeleton para grid de tarjetas
export const SkeletonGrid = ({
  items = 6,
  columns = 3,
  className = '',
  gap = 'gap-6'
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} ${gap} ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

// Skeleton para perfil de usuario
export const SkeletonProfile = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-6 ${getShadowClasses('sm')} ${className}`}>
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <SkeletonTitle className="mb-2" />
          <SkeletonText lines={2} width="w-1/2" />
        </div>
      </div>
    </div>
  );
};

// Skeleton para estadísticas/dashboard
export const SkeletonStats = ({
  items = 4,
  className = '',
  layout = 'grid'
}) => {
  const containerClasses = layout === 'grid'
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
    : 'space-y-4';

  return (
    <div className={`${containerClasses} ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className={`bg-white rounded-lg border border-slate-200 p-6 ${getShadowClasses('sm')}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <SkeletonTitle size="sm" width="w-1/2" className="mb-2" />
              <Skeleton className="w-16 h-8" />
            </div>
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
