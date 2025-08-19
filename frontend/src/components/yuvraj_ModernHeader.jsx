import YuvrajModernNavPill from './yuvraj_ModernNavPill.jsx';
import YuvrajNavbar from './yuvraj_Navbar.jsx';

const YuvrajModernHeader = ({
  title,
  subtitle,
  icon = "✨",
  variant = "default", // default, announcements, polling
  className = "",
  showNavigation = false,
  currentView = "announcements"
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'announcements':
        return 'bg-blue-500/20';
      case 'polling':
        return 'bg-purple-500/20';
      default:
        return 'bg-blue-500/20';
    }
  };

  return (
    <div className={`mb-12 ${className}`}>
      {/* Main Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-12 w-12 drop-shadow-lg" />
            <div className={`absolute inset-0 rounded-full ${getBackgroundColor()} blur-md opacity-70`} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white/95 mb-1">{title}</h1>
            <p className="text-white/70 text-lg">{subtitle}</p>
          </div>
        </div>
        
        {/* Navigation Buttons */}
        {showNavigation && (
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = window.location.pathname.replace('/PollingAndSurvey', '/announcements')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentView === "announcements"
                  ? "bg-blue-500/80 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              📢 Announcements
            </button>
            <button
              onClick={() => window.location.href = window.location.pathname.replace('/announcements', '/PollingAndSurvey')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                currentView === "forms"
                  ? "bg-blue-500/80 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              📝 Forms
            </button>
          </div>
        )}
      </div>

      {/* Navbar */}
      <YuvrajNavbar />
    </div>
  );
};

export default YuvrajModernHeader;
