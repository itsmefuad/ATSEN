import React from 'react';
import { Link } from 'react-router-dom';

const AnnouncementCard = ({ announcement }) => {
  return (
    <Link to={`/announcement/${announcement._id}`}>
      <div className="bg-white rounded-lg p-6 mb-4 shadow-md hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold mb-2">{announcement.title}</h2>
        <p className="text-gray-600 mb-2 line-clamp-2">{announcement.content}</p>
        <p className="text-sm text-gray-500">
          {new Date(announcement.date).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}

export default AnnouncementCard;
