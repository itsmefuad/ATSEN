// Utility function to sort institution announcements
// Pinned announcements are sorted by updatedAt (most recently pinned first)
// Unpinned announcements are sorted by createdAt (newest first)
export const sortInstitutionAnnouncements = (announcements) => {
  return announcements.sort((a, b) => {
    // First, sort by isPinned (pinned items first)
    if (a.isPinned !== b.isPinned) {
      return b.isPinned - a.isPinned; // true (1) comes before false (0)
    }

    // For pinned items, sort by updatedAt (most recently pinned first)
    if (a.isPinned && b.isPinned) {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }

    // For unpinned items, sort by createdAt (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
};
