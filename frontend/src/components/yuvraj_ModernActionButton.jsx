import { useState } from 'react';

const YuvrajModernActionButton = ({ 
  children, 
  variant = "primary", // primary, secondary, ghost, danger
  size = "medium", // small, medium, large
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = "",
  fullWidth = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = "relative overflow-hidden transition-all duration-300 ease-out font-medium select-none inline-flex items-center justify-center";
  
  const sizeClasses = {
    small: "px-4 py-2 text-sm rounded-xl",
    medium: "px-6 py-3 text-base rounded-2xl",
    large: "px-8 py-4 text-lg rounded-3xl"
  };

  const variantClasses = {
    primary: {
      base: "bg-gradient-to-r from-blue-500/80 to-purple-600/80 border border-blue-400/50 shadow-[0_8px_24px_rgba(59,130,246,0.3)]",
      hover: "hover:from-blue-500/90 hover:to-purple-600/90 hover:border-blue-400/60 hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)]",
      active: "active:from-blue-500/70 active:to-purple-600/70",
      disabled: "opacity-50 cursor-not-allowed"
    },
    secondary: {
      base: "bg-gradient-to-r from-white/20 to-white/15 border border-white/30 shadow-[0_8px_24px_rgba(255,255,255,0.15)]",
      hover: "hover:from-white/25 hover:to-white/20 hover:border-white/40 hover:shadow-[0_12px_32px_rgba(255,255,255,0.2)]",
      active: "active:from-white/15 active:to-white/10",
      disabled: "opacity-50 cursor-not-allowed"
    },
    ghost: {
      base: "bg-transparent border border-white/20 text-white/90",
      hover: "hover:bg-white/10 hover:border-white/30 hover:text-white",
      active: "active:bg-white/5",
      disabled: "opacity-50 cursor-not-allowed"
    },
    danger: {
      base: "bg-gradient-to-r from-red-500/80 to-pink-600/80 border border-red-400/50 shadow-[0_8px_24px_rgba(239,68,68,0.3)]",
      hover: "hover:from-red-500/90 hover:to-pink-600/90 hover:border-red-400/60 hover:shadow-[0_12px_32px_rgba(239,68,68,0.4)]",
      active: "active:from-red-500/70 active:to-pink-600/70",
      disabled: "opacity-50 cursor-not-allowed"
    }
  };

  const config = variantClasses[variant];
  const stateClasses = {
    hover: isHovered && !disabled ? "scale-105" : "",
    pressed: isPressed ? "scale-95" : "",
    disabled: disabled ? config.disabled : ""
  };

  const handleMouseEnter = () => !disabled && setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleMouseDown = () => !disabled && setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${config.base} ${config.hover} ${config.active} ${stateClasses.hover} ${stateClasses.pressed} ${stateClasses.disabled} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled || loading}
    >
      {/* Liquid glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-white/[0.02] pointer-events-none" />
      
      {/* Shimmer effect on hover */}
      {isHovered && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center space-x-2">
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            {icon && <span className="text-lg">{icon}</span>}
            <span className="text-white font-medium">{children}</span>
          </>
        )}
      </div>
      
      {/* Pressed state overlay */}
      {isPressed && (
        <div className="absolute inset-0 bg-black/10 rounded-inherit" />
      )}
    </button>
  );
};

export default YuvrajModernActionButton;
