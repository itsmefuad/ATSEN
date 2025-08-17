import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import AnnouncementCard from '../components/AnnouncementCard';

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await axios.get('/api/announcements');
        setAnnouncements(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <AnnouncementCard key={announcement._id} announcement={announcement} />
        ))}
      </div>
    </div>
  );
};

export default AnnouncementList;
