const YuvrajAnnouncementCard = ({ title, children }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl">
      <div className="p-6">
        <h3 className="text-2xl font-extrabold text-gray-800">{title}</h3>
        <div className="mt-4 rounded-xl bg-gray-50 p-5 text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default YuvrajAnnouncementCard;
