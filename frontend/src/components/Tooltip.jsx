import React, { useState, useRef, useEffect } from 'react';

// Componente de Tooltip
export const Tooltip = ({
  content,
  children,
  placement = 'top',
  delay = 300,
  className = '',
  disabled = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTimeout, setShowTimeout] = useState(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  // Posicionamiento del tooltip
  const getTooltipPosition = () => {
    const positions = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
      'top-start': 'bottom-full left-0 mb-2',
      'top-end': 'bottom-full right-0 mb-2',
      'bottom-start': 'top-full left-0 mt-2',
      'bottom-end': 'top-full right-0 mt-2',
      'left-start': 'right-full top-0 mr-2',
      'left-end': 'right-full bottom-0 mr-2',
      'right-start': 'left-full top-0 ml-2',
      'right-end': 'left-full bottom-0 ml-2',
    };

    return positions[placement] || positions.top;
  };

  // Eventos del mouse
  const handleMouseEnter = () => {
    if (disabled) return;

    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    setShowTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (showTimeout) {
      clearTimeout(showTimeout);
    }
    setIsVisible(false);
  };

  // Eventos de focus para accesibilidad
  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
    };
  }, [showTimeout]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Elemento trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="inline-block"
        {...props}
      >
        {children}
      </div>

      {/* Tooltip */}
      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`
            absolute z-50 px-3 py-2 text-sm font-medium text-white
            bg-slate-900 rounded-lg shadow-lg max-w-xs
            transition-opacity duration-200 ease-in-out
            ${getTooltipPosition()}
          `}
          style={{
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {content}

          {/* Flecha del tooltip */}
          <div
            className={`
              absolute w-2 h-2 bg-slate-900 transform rotate-45
              ${placement.includes('top') ? 'top-full -mt-1 left-1/2 -translate-x-1/2' : ''}
              ${placement.includes('bottom') ? 'bottom-full -mb-1 left-1/2 -translate-x-1/2' : ''}
              ${placement.includes('left') ? 'left-full -ml-1 top-1/2 -translate-y-1/2' : ''}
              ${placement.includes('right') ? 'right-full -mr-1 top-1/2 -translate-y-1/2' : ''}
            `}
          />
        </div>
      )}
    </div>
  );
};

// Tooltip con trigger personalizado
export const TooltipTrigger = ({
  trigger,
  content,
  placement = 'top',
  className = '',
  ...props
}) => {
  return (
    <Tooltip content={content} placement={placement} className={className} {...props}>
      {trigger}
    </Tooltip>
  );
};

// Hook para tooltips programáticos
export const useTooltip = () => {
  const [tooltip, setTooltip] = useState(null);

  const showTooltip = (element, content, placement = 'top') => {
    setTooltip({ element, content, placement });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  const TooltipPortal = () => {
    if (!tooltip) return null;

    const rect = tooltip.element.getBoundingClientRect();

    return (
      <div
        className="fixed z-[9999] px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg shadow-lg max-w-xs pointer-events-none"
        style={{
          left: rect.left + rect.width / 2,
          top: rect.top - 10,
          transform: 'translateX(-50%)',
        }}
      >
        {tooltip.content}
        <div className="absolute w-2 h-2 bg-slate-900 transform rotate-45 top-full left-1/2 -translate-x-1/2 -mt-1" />
      </div>
    );
  };

  return {
    showTooltip,
    hideTooltip,
    TooltipPortal
  };
};

export default Tooltip;
