import React, { useState } from 'react';

function Tooltip({ content, children, className = '' }) {
  const [visible, setVisible] = useState(false);

  if (!content) return children;

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 text-[11px] font-medium text-white bg-slate-900/95 border border-white/20 rounded-lg shadow-xl backdrop-blur-md pointer-events-none z-50 whitespace-normal max-w-xs text-center leading-snug animate-fade-in"
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

export default Tooltip;
