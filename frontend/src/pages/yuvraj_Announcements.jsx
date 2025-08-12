import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";

const Yuvraj_Announcements = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center gap-4">
          <div className="rounded-full bg-white/40 px-4 py-2 text-white shadow backdrop-blur">
            Home
          </div>
          <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">
            Dashboard
          </div>
          <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">
            Notifications
          </div>
          <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">
            Profile
          </div>
        </nav>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          <div className="space-y-6">
            <YuvrajAnnouncementCard title="Mid-Term Exam schedule for Summer 2025">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              </p>
            </YuvrajAnnouncementCard>

            <YuvrajAnnouncementCard title="Mid-Term Exam schedule for Summer 2025">
              <p>
                Exam schedules of Architecture programs will be provided by the respective department. For any kind of assistance, contact the Department Coordination Officer (DCO) of your respective Department
              </p>
            </YuvrajAnnouncementCard>

            <YuvrajAnnouncementCard title="UG &quot;Wishlist&quot; Event Schedule, Fall 2025">
              <p>
                The Fall 2025 advising preparatory phase will begin with the upcoming "Wishlist" event, which will help us plan course offerings for the term. All undergraduate programs will participate, except PHR.
              </p>
            </YuvrajAnnouncementCard>

            <YuvrajAnnouncementCard title="Convocation registration closes soon">
              <p>
                Final-year students must complete their convocation registration by the end of this week. Late registrations will not be accepted.
              </p>
            </YuvrajAnnouncementCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_Announcements;


