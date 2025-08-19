import YuvrajModernNavPill from './yuvraj_ModernNavPill.jsx';
import YuvrajNavbar from './yuvraj_Navbar.jsx';

const YuvrajModernHeader = ({ 
  title, 
  subtitle, 
  icon = "✨",
  variant = "default", // default, announcements, polling
  className = ""
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
    <div className={`mb-12 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-12 w-12 drop-shadow-lg" />
          <div className={`absolute inset-0 ${getBackgroundColor()} rounded-full blur-xl`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white/95">{title}</h1>
          <p className="text-white/70">{subtitle}</p>
        </div>
      </div>
      
      <nav className="flex items-center gap-3">
        <YuvrajModernNavPill variant="default" active>Home</YuvrajModernNavPill>
        <YuvrajModernNavPill variant="secondary">Dashboard</YuvrajModernNavPill>
        <YuvrajModernNavPill variant="secondary">Notifications</YuvrajModernNavPill>
        <YuvrajModernNavPill variant="secondary">Profile</YuvrajModernNavPill>
        <YuvrajNavbar />
      </nav>
    </div>
  );
};

export default YuvrajModernHeader;
