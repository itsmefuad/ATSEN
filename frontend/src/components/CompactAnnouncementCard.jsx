const CompactAnnouncementCard = ({ announcement, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/15"
    >
      <div className="p-4">
        {/* Header with type and date */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">📢</span>
            <span className="px-2 py-1 rounded-full text-white text-xs font-semibold bg-blue-600">
              ANNOUNCEMENT
            </span>
          </div>
          <div className="text-xs text-white/60">
            {new Date(announcement.createdAt || Date.now()).toLocaleDateString()}
          </div>
        </div>

        {/* Title with shadow */}
        <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg line-clamp-2">
          {announcement.title || 'Untitled Announcement'}
        </h3>

        {/* Compact content area */}
        <div className="text-xs text-white/70">
          <p className="line-clamp-2">
            {announcement.content || announcement.description || 'No content available'}
          </p>
          {announcement.author && (
            <p className="mt-1 text-white/60">By: {announcement.author}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactAnnouncementCard;
