import { useState } from 'react';
import YuvrajLiquidGlassCard from './yuvraj_LiquidGlassCard.jsx';

const YuvrajEnhancedAnnouncementCard = ({ 
  title, 
  content, 
  author, 
  createdAt, 
  priority = "normal", // low, normal, high, urgent
  category,
  className = "",
  onClick,
  isCompact = false,
  isPrivileged = false,
  onDelete,
  id
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const priorityConfig = {
    low: { color: "from-emerald-400/20 to-emerald-600/10", border: "border-emerald-400/30", badge: "Low Priority" },
    normal: { color: "from-blue-400/20 to-blue-600/10", border: "border-blue-400/30", badge: "Normal" },
    high: { color: "from-amber-400/20 to-amber-600/10", border: "border-amber-400/30", badge: "High Priority" },
    urgent: { color: "from-red-400/20 to-red-600/10", border: "border-red-400/30", badge: "Urgent" }
  };

  const config = priorityConfig[priority];

  const formatDate = (date) => {
    const now = new Date();
    const announcementDate = new Date(date);
    const diffTime = Math.abs(now - announcementDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return announcementDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: announcementDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <YuvrajLiquidGlassCard
      variant="interactive"
      className={`${className} group`}
      onClick={onClick}
      shimmer={isHovered}
    >
      <div className="space-y-4">
        {/* Header with priority and category */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-white/95 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200">
              {title}
            </h3>
            {category && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white/80">
                {category}
              </div>
            )}
          </div>
          
          {/* Priority badge */}
          <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium text-white/90 border ${config.border} bg-gradient-to-r ${config.color}`}>
            {config.badge}
          </div>
        </div>

        {/* Content */}
        {!isCompact && content && (
          <div className="text-white/80 leading-relaxed line-clamp-3 group-hover:text-white/90 transition-colors duration-200">
            {content}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-sm text-white/70">
            Created {formatDate(createdAt)}
          </div>
          
          {/* Action buttons for privileged users */}
          {isPrivileged && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button 
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs text-white/90 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClick) onClick();
                }}
              >
                Edit
              </button>
              <button 
                className="px-3 py-1 rounded-full bg-red-500/20 hover:bg-red-500/30 text-xs text-red-400 transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete(id);
                }}
              >
                Delete
              </button>
            </div>
          )}
          
          {/* Interactive indicator for non-privileged users */}
          {!isPrivileged && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </YuvrajLiquidGlassCard>
  );
};

export default YuvrajEnhancedAnnouncementCard;
