import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../lib/axios';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const response = await axios.get(`/api/announcements/${id}`);
        setAnnouncement(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  if (!announcement) return <div className="text-center py-8">Announcement not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg p-8 shadow-md">
        <h1 className="text-3xl font-bold mb-4">{announcement.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {new Date(announcement.date).toLocaleDateString()}
        </p>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetail;
