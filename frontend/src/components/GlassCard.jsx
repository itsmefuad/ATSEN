import React from 'react';

const GlassCard = ({ className = '', children, style = {} }) => {
  return (
    <div className={`glass-card ${className}`} style={style}>
      <div className="glass-overlay" />
      <div className="sheen" />
      <div className="p-4">{children}</div>
    </div>
  );
};

export default GlassCard;
