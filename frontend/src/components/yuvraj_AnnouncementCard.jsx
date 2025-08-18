const YuvrajAnnouncementCard = ({ title, children }) => {
  return (
    <div className="relative rounded-2xl border-2 border-white/20 bg-white/10 shadow-xl backdrop-blur hover:shadow-2xl transition-all duration-300 hover:scale-[1.002] hover:bg-white/15 overflow-hidden max-w-60pct">
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


