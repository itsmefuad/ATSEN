// In-memory pseudo data
const announcements = [
    {
        _id: "1",
        title: "Mid-Term Exam schedule for Summer 2025",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
        date: new Date(),
        createdAt: new Date()
    },
    {
        _id: "2",
        title: "UG Wishlist Event Schedule, Fall 2025",
        content: "The Fall 2025 advising preparatory phase will begin with the upcoming Wishlist event, which will help us plan course offerings for the term. All undergraduate programs will participate, except PMR.",
        date: new Date(),
        createdAt: new Date()
    },
    {
        _id: "3",
        title: "Exam schedules of Architecture programs",
        content: "Exam schedules of Architecture programs will be provided by the respective department. For any kind of assistance, contact the Department Coordination Officer (DCO) of your respective Department",
        date: new Date(),
        createdAt: new Date()
    }
];

// Get all announcements
export const getAnnouncements = async (req, res) => {
    try {
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single announcement
export const getAnnouncement = async (req, res) => {
    try {
        const announcement = announcements.find(a => a._id === req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new announcement (for testing purposes)
export const createAnnouncement = async (req, res) => {
    try {
        const newAnnouncement = {
            _id: (announcements.length + 1).toString(),
            ...req.body,
            date: new Date(),
            createdAt: new Date()
        };
        announcements.push(newAnnouncement);
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};