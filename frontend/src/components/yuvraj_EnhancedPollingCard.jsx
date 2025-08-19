import { useState } from 'react';
import YuvrajLiquidGlassCard from './yuvraj_LiquidGlassCard.jsx';

const YuvrajEnhancedPollingCard = ({
  form, // Pass the entire form object
  title, // Keep for backward compatibility
  type, // poll, qna, survey
  createdAt,
  responseCount = 0,
  isActive = true,
  className = "",
  onClick,
  isCompact = false,
  isPrivileged = false,
  isMandatory = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Extract properties from form object if provided, otherwise use props
  const formTitle = form?.title || title || "Untitled Form";
  const formType = form?.type || type || "poll";
  const formCreatedAt = form?.createdAt || createdAt || new Date();
  const formResponseCount = form?.responseCount || responseCount || 0;
  const formIsActive = form?.isActive !== undefined ? form.isActive : isActive;
  const formIsMandatory = form?.isMandatory || isMandatory || false;

  const typeConfig = {
    poll: {
      color: "from-blue-400/20 to-blue-600/10",
      border: "border-blue-400/30",
      icon: "📊",
      label: "Poll"
    },
    qna: {
      color: "from-cyan-400/20 to-cyan-600/10",
      border: "border-cyan-400/30",
      icon: "❓",
      label: "Q&A"
    },
    survey: {
      color: "from-emerald-400/20 to-emerald-600/10",
      border: "border-emerald-400/30",
      icon: "📝",
      label: "Survey"
    }
  };

  const config = typeConfig[formType] || typeConfig.poll;

  const formatDate = (date) => {
    const now = new Date();
    const creationDate = new Date(date);
    const diffTime = Math.abs(now - creationDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return creationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: creationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getStatusColor = () => {
    if (!formIsActive) return "from-gray-400/20 to-gray-600/10 border-gray-400/30";
    if (formResponseCount === 0) return "from-amber-400/20 to-amber-600/10 border-amber-400/30";
    if (formResponseCount < 10) return "from-blue-400/20 to-blue-600/10 border-blue-400/30";
    return "from-emerald-400/20 to-emerald-600/10 border-emerald-400/30";
  };

  const getStatusText = () => {
    if (!formIsActive) return "Inactive";
    if (formResponseCount === 0) return "No responses";
    if (formResponseCount < 10) return `${formResponseCount} responses`;
    return `${formResponseCount}+ responses`;
  };

  return (
    <YuvrajLiquidGlassCard
      variant="interactive"
      className={`${className} group ${!formIsActive ? 'opacity-75' : ''}`}
      onClick={onClick}
      shimmer={isHovered}
      disabled={!formIsActive}
    >
      <div className="space-y-4">
        {/* Header with type and status */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{config.icon}</span>
              <div className={`px-3 py-1 rounded-full text-xs font-medium text-white/90 border ${config.border} bg-gradient-to-r ${config.color}`}>
                {config.label}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white/95 leading-tight line-clamp-2 group-hover:text-white transition-colors duration-200">
              {formTitle}
            </h3>
          </div>

          {/* Mandatory/Optional indicator */}
          <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium border ${
            formIsMandatory
              ? 'bg-red-500/20 border-red-400/30 text-red-400'
              : 'bg-green-500/20 border-green-400/30 text-green-400'
          }`}>
            {formIsMandatory ? '🔴 Mandatory' : '🟢 Optional'}
          </div>

          {/* Status badge - Only show for privileged users */}
          {isPrivileged && (
            <div className={`ml-3 px-3 py-1 rounded-full text-xs font-medium text-white/90 border bg-gradient-to-r ${getStatusColor()}`}>
              {getStatusText()}
            </div>
          )}
        </div>

        {/* Response count visualization - Only show for privileged users */}
        {!isCompact && isPrivileged && formResponseCount !== undefined && (
          <div className="flex items-center space-x-3">
            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-500"
                style={{
                  width: `${Math.min((formResponseCount / Math.max(formResponseCount, 1)) * 100, 100)}%`
                }}
              />
            </div>
            <span className="text-sm text-white/70 min-w-[60px] text-right">
              {formResponseCount} responses
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-sm text-white/70">
            Created {formatDate(formCreatedAt)}
          </div>

          {/* Action buttons for privileged users */}
          {isPrivileged && (
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
              <button className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs text-white/90 transition-colors duration-200">
                Edit
              </button>
              <button className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-xs text-white/90 transition-colors duration-200">
                Results
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

export default YuvrajEnhancedPollingCard;
