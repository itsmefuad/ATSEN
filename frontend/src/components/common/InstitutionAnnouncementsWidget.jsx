import { useState, useEffect } from "react";
import { Megaphone, Calendar, Pin, Tag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/axios";

const InstitutionAnnouncementsWidget = ({ userType, userId, institutionSlug }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userType && userId) {
      fetchAnnouncements();
    }
  }, [userType, userId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(
        `/institution-announcements/user/${userType}/${userId}`
      );
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching user announcements:", error);
      setError("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="card bg-base-100 border border-base-300 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="loading loading-spinner loading-md text-primary"></div>
          <span className="ml-3 text-base-content/60">
            Loading announcements...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100 border border-base-300 p-6">
        <div className="flex items-center mb-4">
          <Megaphone className="h-6 w-6 text-[#00A2E8] mr-3" />
          <h3 className="text-lg font-semibold text-base-content">
            Institution Announcements
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Megaphone className="h-6 w-6 text-[#00A2E8] mr-3" />
          <h3 className="text-lg font-semibold text-base-content">
            Institution Announcements
          </h3>
        </div>
        
                 {announcements.length > 0 && (
           <Link
             to={`/student/announcements/${institutionSlug || announcements[0]?.institution?.slug || 'hogwarts'}`}
             className="btn btn-sm btn-outline btn-primary hover:btn-primary"
           >
             View All
             <ArrowRight className="h-4 w-4 ml-1" />
           </Link>
         )}
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-8">
          <Megaphone className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
          <p className="text-base-content/60">No announcements available</p>
          <p className="text-sm text-base-content/40">
            Check back later for updates from your institutions
          </p>
        </div>
      ) : (
                <div className="space-y-3">
          {announcements.slice(0, 2).map((announcement, index) => (
            <Link
              key={announcement._id}
              to={`/student/announcements/${institutionSlug || announcement.institution?.slug || 'hogwarts'}/${announcement._id}`}
              className={`block p-4 rounded-lg border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 transform ${
                announcement.isPinned
                  ? "border-[#00A2E8]/30 bg-[#00A2E8]/5 hover:bg-[#00A2E8]/10"
                  : "border-base-300 bg-base-50 hover:bg-base-100"
              }`}
              style={{ 
                transitionDelay: `${index * 100}ms` 
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {announcement.isPinned && (
                      <Pin className="h-4 w-4 text-[#00A2E8]" />
                    )}
                    <h4 className="font-semibold text-base-content">
                      {announcement.title}
                    </h4>
                  </div>

                  {announcement.institution && (
                    <p className="text-sm text-[#00A2E8] font-medium mb-2">
                      {announcement.institution.name}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-base-content/80 text-sm mb-3 line-clamp-3">
                {announcement.content}
              </p>

              {announcement.tags && announcement.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Tag className="h-3 w-3 text-base-content/60" />
                  {announcement.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="badge badge-outline badge-xs">
                      {tag}
                    </span>
                  ))}
                  {announcement.tags.length > 3 && (
                    <span className="text-xs text-base-content/60">
                      +{announcement.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-base-content/60">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>
                {announcement.updatedAt !== announcement.createdAt && (
                  <span>Updated: {formatDate(announcement.updatedAt)}</span>
                )}
              </div>
            </Link>
          ))}
          
          {/* Show "View All" link if there are more than 2 announcements */}
          {announcements.length > 2 && (
            <div className="mt-4 text-center">
              <Link
                to={`/student/announcements/${institutionSlug || announcements[0]?.institution?.slug || 'hogwarts'}`}
                className="btn btn-sm btn-ghost btn-outline hover:btn-primary transition-all duration-200"
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                View All {announcements.length} Announcements
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstitutionAnnouncementsWidget;
