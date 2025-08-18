const YuvrajAnnouncementCard = ({ title, children, isPrivileged = false, onEdit, onDelete }) => {
  return (
    <div className="relative rounded-2xl border-2 border-white/20 bg-white/10 shadow-xl backdrop-blur hover:shadow-2xl transition-all duration-300 hover:scale-[1.002] hover:bg-white/15 overflow-hidden max-w-80pct">
      {isPrivileged && (onEdit || onDelete) && (
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-20 origin-top-right" style={{ transformOrigin: 'top right' }}>
          {onEdit && (
            <button onClick={onEdit} className="btn btn-md bg-blue-600 text-white hover:bg-blue-700 border-none" style={{ transform: 'scale(1.6)' }}>
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="btn btn-md bg-red-300 text-red-800 hover:bg-red-400 border-none" style={{ transform: 'scale(1.6)' }}>
              Delete
            </button>
          )}
        </div>
      )}
      <div className="p-6">
        <h3 className="text-2xl font-google-sans text-black drop-shadow-lg font-bold">{title}</h3>
        <div className="mt-4 rounded-xl bg-white/20 p-5 text-black backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
};

export default YuvrajAnnouncementCard;


