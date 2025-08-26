import { useEffect, useState } from "react";
import { fetchAnnouncements } from "../services/announcements";
import AnnouncementCard from "../components/AnnouncementCard";
import Navbar from "../components/Navbar.jsx";

const Landing = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await fetchAnnouncements();
        if (isMounted) setAnnouncements(data);
      } catch (error) {
        setErrorMessage(
          "Failed to load announcements. Please try again later."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const pinned = announcements.filter((a) => a.pinned);
  const others = announcements.filter((a) => !a.pinned);

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-base-content">
            Education Facilitation System
          </h1>
          <p className="text-base-content/70">
            Institution announcements and highlights
          </p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : errorMessage ? (
          <div className="alert alert-error">
            <span>{errorMessage}</span>
          </div>
        ) : (
          <div className="space-y-8">
            {pinned.length > 0 && (
              <section>
                <div className="mb-3 flex items-center gap-2">
                  <div className="badge badge-primary text-primary-content px-3 py-1 text-sm font-medium">
                    Featured
                  </div>
                  <h2 className="text-xl font-semibold text-base-content">
                    Highlighted Announcements
                  </h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {pinned.map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} highlighted />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-center gap-2">
                <div className="badge badge-neutral text-neutral-content px-3 py-1 text-sm font-medium">
                  Latest
                </div>
                <h2 className="text-xl font-semibold text-base-content">
                  All Announcements
                </h2>
              </div>
              {others.length === 0 && pinned.length === 0 ? (
                <div className="text-base-content/60">
                  No announcements yet.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...pinned, ...others].map((a) => (
                    <AnnouncementCard key={a.id} announcement={a} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
