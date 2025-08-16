const YuvrajAnnouncementCard = ({ title, children }) => {
  return (
    <div className="rounded-2xl border border-base-200/60 bg-base-100/80 shadow-xl backdrop-blur">
      <div className="p-6">
        <h3 className="text-2xl font-extrabold text-base-content/90">{title}</h3>
        <div className="mt-4 rounded-xl bg-base-200/60 p-5 text-base-content/80">
          {children}
        </div>
      </div>
    </div>
  );
};

export default YuvrajAnnouncementCard;


