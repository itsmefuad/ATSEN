import { useState } from 'react';

const YuvrajLiquidGlassCard = ({ 
  children, 
  className = "", 
  variant = "default", // default, elevated, interactive
  onClick,
  disabled = false,
  shimmer = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = "relative overflow-hidden transition-all duration-300 ease-out";
  
  const variantClasses = {
    default: "bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
    elevated: "bg-gradient-to-br from-white/[0.12] to-white/[0.06] border border-white/[0.16] shadow-[0_16px_48px_rgba(0,0,0,0.16)]",
    interactive: "bg-gradient-to-br from-white/[0.10] to-white/[0.05] border border-white/[0.14] shadow-[0_12px_40px_rgba(0,0,0,0.14)]"
  };

  const stateClasses = {
    hover: isHovered && !disabled ? "scale-[1.02] shadow-[0_20px_60px_rgba(0,0,0,0.20)]" : "",
    pressed: isPressed ? "scale-[0.98] shadow-[0_8px_24px_rgba(0,0,0,0.16)]" : "",
    disabled: disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  };

  const handleMouseEnter = () => !disabled && setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleMouseDown = () => !disabled && setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses.hover} ${stateClasses.pressed} ${stateClasses.disabled} ${className}`}
      style={{
        borderRadius: '20px',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={!disabled ? onClick : undefined}
    >
      {/* Liquid glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none" />
      
      {/* Shimmer effect */}
      {shimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full animate-shimmer pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-white/[0.08] to-transparent opacity-0 transition-opacity duration-300 pointer-events-none" 
           style={{ opacity: isHovered ? 1 : 0 }} />
    </div>
  );
};

export default YuvrajLiquidGlassCard;
