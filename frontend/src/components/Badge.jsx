import React from 'react';
import { Award, Trophy, Star, Crown, Gem, CheckCircle } from 'lucide-react';

const BadgeIcon = ({ iconName, className = "h-5 w-5" }) => {
  const iconMap = {
    Award,
    Trophy, 
    Star,
    Crown,
    Gem,
    CheckCircle
  };
  
  const Icon = iconMap[iconName] || Award;
  return <Icon className={className} />;
};

const Badge = ({ achievement, size = 'md', showDescription = false }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm', 
    lg: 'h-16 w-16 text-base',
    xl: 'h-20 w-20 text-lg'
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
    xl: 'h-9 w-9'
  };
  
  const colorClasses = {
    bronze: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white',
    silver: 'bg-gradient-to-br from-gray-300 to-gray-500 text-white',
    gold: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white',
    platinum: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[achievement.badgeColor]} 
          rounded-full flex items-center justify-center shadow-lg relative
          transform hover:scale-110 transition-transform duration-200
        `}
        title={achievement.description}
      >
        <BadgeIcon 
          iconName={achievement.badgeIcon} 
          className={iconSizes[size]} 
        />
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-60"></div>
      </div>
      
      {showDescription && (
        <div className="text-center mt-2">
          <div className="font-medium text-sm">{achievement.name}</div>
          <div className="text-xs text-base-content/60">{achievement.description}</div>
        </div>
      )}
    </div>
  );
};

export default Badge;
