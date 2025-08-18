const FormCard = ({ form, isPrivileged, onEdit, onViewResults, onRespond, compact = false }) => {
  const getTypeColor = (type) => {
    return type === 'poll' ? '#059669' : '#2563EB';
  };

  const getTypeIcon = (type) => {
    return type === 'poll' ? '📊' : '❓';
  };

  if (compact) {
    return (
      <div 
        onClick={onRespond || onEdit}
        className="cursor-pointer rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/15"
      >
        <div className="p-4">
          {/* Header with type badge and icon */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getTypeIcon(form.type || 'poll')}</span>
              <span 
                className="px-2 py-1 rounded-full text-white text-xs font-semibold" 
                style={{background: getTypeColor(form.type || 'poll')}}
              >
                {(form.type || 'poll').toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-white/60">
              {new Date(form.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Title with shadow */}
          <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">
            {form.title || 'Untitled Form'}
          </h3>

          {/* Compact content area */}
          <div className="text-xs text-white/70">
            <p>Created: {new Date(form.createdAt).toLocaleDateString()}</p>
            {form.author && <p>By: {form.author}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 shadow-xl backdrop-blur hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
      <div className="p-5">
        {/* Header with type badge and icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">{getTypeIcon(form.type || 'poll')}</span>
            <span 
              className="px-2 py-1 rounded-full text-white text-xs font-semibold" 
              style={{background: getTypeColor(form.type || 'poll')}}
            >
              {(form.type || 'poll').toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-white/60">
            {new Date(form.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Title with stronger shadow and bigger size */}
        <h3 className="text-3xl font-extrabold text-white mb-3 drop-shadow-2xl">
          {form.title || 'Untitled Form'}
        </h3>

        {/* Content area */}
        <div className="rounded-xl bg-white/20 p-4 text-white/90 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-white/70">Form Details:</span>
          </div>
          <div className="text-sm">
            <p>Type: <span className="font-semibold">{(form.type || 'poll').toUpperCase()}</span></p>
            <p>Created: <span className="font-semibold">{new Date(form.createdAt).toLocaleString()}</span></p>
            {form.author && <p>Author: <span className="font-semibold">{form.author}</span></p>}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          {isPrivileged ? (
            <>
              <button 
                onClick={onEdit}
                className="btn btn-ghost btn-sm text-white hover:bg-white/20"
              >
                Edit Form
              </button>
              <button 
                onClick={onViewResults}
                className="btn btn-outline btn-sm text-white border-white/30 hover:bg-white/20"
              >
                View Results
              </button>
            </>
          ) : (
            <button 
              onClick={onRespond}
              className="btn btn-primary btn-md px-6 py-2 text-base font-medium"
            >
              Respond to Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormCard;
