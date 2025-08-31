/*
  Card to render a single announcement. Shows title, date, and content.
*/
const AnnouncementCard = ({ announcement, highlighted = false }) => {
  const { title, content, createdAt, author, pinned, externalLinks, images } = announcement;

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${highlighted || pinned ? "border-sky-300" : "border-gray-200"} hover:shadow-md transition-shadow`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-800 leading-snug">{title}</h3>
          {(highlighted || pinned) && <div className="bg-sky-500 text-white px-2 py-1 rounded text-xs font-medium">Highlighted</div>}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(createdAt).toLocaleString()} {author ? `• ${author}` : ""}
        </p>
        <p className="mt-3 text-gray-700">{content}</p>
        
        {/* Preview indicators for external links and images */}
        {(externalLinks?.length > 0 || images?.length > 0) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            {externalLinks?.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                {externalLinks.length} link{externalLinks.length !== 1 ? 's' : ''}
              </span>
            )}
            {images?.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                {images.length} image{images.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;


