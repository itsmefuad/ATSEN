import { useState } from 'react';

const YuvrajModernNavPill = ({ 
  children, 
  active = false, 
  onClick,
  variant = "default", // default, primary, secondary
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = "relative overflow-hidden transition-all duration-300 ease-out cursor-pointer select-none";
  
  const variantClasses = {
    default: active 
      ? "bg-gradient-to-r from-white/25 to-white/20 border border-white/30 shadow-[0_8px_24px_rgba(255,255,255,0.15)]" 
      : "bg-gradient-to-r from-white/15 to-white/10 border border-white/20 hover:from-white/20 hover:to-white/15 hover:border-white/25",
    primary: active 
      ? "bg-gradient-to-r from-blue-400/30 to-purple-400/25 border border-blue-400/40 shadow-[0_8px_24px_rgba(59,130,246,0.25)]" 
      : "bg-gradient-to-r from-blue-400/20 to-purple-400/15 border border-blue-400/30 hover:from-blue-400/25 hover:to-purple-400/20",
    secondary: active 
      ? "bg-gradient-to-r from-emerald-400/25 to-cyan-400/20 border border-emerald-400/35 shadow-[0_8px_24px_rgba(16,185,129,0.2)]" 
      : "bg-gradient-to-r from-emerald-400/15 to-cyan-400/10 border border-emerald-400/25 hover:from-emerald-400/20 hover:to-cyan-400/15"
  };

  const stateClasses = {
    hover: isHovered ? "scale-105 shadow-[0_12px_32px_rgba(255,255,255,0.2)]" : "",
    active: active ? "scale-100" : "scale-95"
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses.hover} ${stateClasses.active} ${className}`}
      style={{
        borderRadius: '9999px',
        padding: '12px 20px',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Liquid glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] pointer-events-none" />
      
      {/* Active state indicator */}
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.08] to-transparent rounded-full" />
      )}
      
      {/* Shimmer effect on hover */}
      {isHovered && !active && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center">
        <span className={`font-medium text-sm transition-colors duration-200 ${
          active ? 'text-white' : 'text-white/90 group-hover:text-white'
        }`}>
          {children}
        </span>
      </div>
      
      {/* Subtle glow effect */}
      {active && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.1] to-transparent opacity-0 animate-pulse" />
      )}
    </div>
  );
};

export default YuvrajModernNavPill;
