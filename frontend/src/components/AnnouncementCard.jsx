/*
  Card to render a single announcement. Shows title, date, and content.
*/
const AnnouncementCard = ({ announcement, highlighted = false }) => {
  const { title, content, createdAt, author, pinned } = announcement;

  return (
    <div className={`card border ${highlighted || pinned ? "border-primary" : "border-base-200"} bg-base-100 shadow-sm`}>
      <div className="card-body">
        <div className="flex items-start justify-between gap-3">
          <h3 className="card-title text-lg leading-snug">{title}</h3>
          {(highlighted || pinned) && <div className="badge badge-primary">Highlighted</div>}
        </div>
        <p className="text-sm text-base-content/70">
          {new Date(createdAt).toLocaleString()} {author ? `• ${author}` : ""}
        </p>
        <p className="mt-2 text-base-content/80">{content}</p>
      </div>
    </div>
  );
};

export default AnnouncementCard;


