import Achievement from '../models/Achievement.js';
import StudentAchievement from '../models/StudentAchievement.js';
import Grade from '../models/Grade.js';
import Student from '../models/student.js';

// Get all achievements
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ pointsRequired: 1 });
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student achievements for a specific room
export const getStudentAchievements = async (req, res) => {
  try {
    const { studentId, roomId } = req.params;
    
    const achievements = await StudentAchievement.find({
      student: studentId,
      room: roomId
    })
    .populate('achievement')
    .populate('student', 'name email')
    .populate('room', 'name')
    .sort({ dateEarned: -1 });

    // Calculate total points
    const totalPoints = achievements.reduce((sum, sa) => sum + sa.pointsEarned, 0);

    res.json({
      achievements,
      totalPoints,
      achievementCount: achievements.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get room standings (leaderboard)
export const getRoomStandings = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Get all student achievements for this room
    const achievements = await StudentAchievement.find({ room: roomId })
      .populate('student', 'name email')
      .populate('achievement');

    // Group by student and calculate totals
    const studentStats = {};
    
    achievements.forEach(sa => {
      const studentId = sa.student._id.toString();
      if (!studentStats[studentId]) {
        studentStats[studentId] = {
          student: sa.student,
          totalPoints: 0,
          achievements: [],
          badgeCounts: { bronze: 0, silver: 0, gold: 0, platinum: 0 }
        };
      }
      
      studentStats[studentId].totalPoints += sa.pointsEarned;
      studentStats[studentId].achievements.push(sa);
      studentStats[studentId].badgeCounts[sa.achievement.badgeColor]++;
    });

    // Convert to array and sort by total points
    const standings = Object.values(studentStats)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((student, index) => ({
        rank: index + 1,
        ...student
      }));

    res.json(standings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Calculate and award achievements for a student
export const calculateAchievements = async (studentId, roomId) => {
  try {
    // Get student's grade data
    const grade = await Grade.findOne({ student: studentId, room: roomId });
    if (!grade) return;

    // Get all active achievements
    const achievements = await Achievement.find({ isActive: true });

    for (const achievement of achievements) {
      // Check if student already has this achievement in this room
      const existingAchievement = await StudentAchievement.findOne({
        student: studentId,
        achievement: achievement._id,
        room: roomId
      });

      if (existingAchievement) continue; // Skip if already earned

      let criteriaMetValue = 0;
      let criteriaMet = false;

      switch (achievement.criteriaType) {
        case 'total_marks':
          criteriaMetValue = grade.totalMarks;
          criteriaMet = grade.totalMarks >= achievement.criteriaValue;
          break;
        
        case 'average_marks':
          const avgPercentage = (grade.totalMarks / 60) * 100; // Assuming 60 is max total
          criteriaMetValue = avgPercentage;
          criteriaMet = avgPercentage >= achievement.criteriaValue;
          break;
        
        case 'assessment_count':
          criteriaMetValue = grade.averageAssessmentMarks > 0 ? 1 : 0; // Simple check if has assessment marks
          criteriaMet = criteriaMetValue >= achievement.criteriaValue;
          break;
        
        default:
          continue; // Skip unsupported criteria types for now
      }

      if (criteriaMet) {
        // Award the achievement
        const studentAchievement = new StudentAchievement({
          student: studentId,
          achievement: achievement._id,
          room: roomId,
          pointsEarned: achievement.pointsRequired,
          criteriaMetValue: criteriaMetValue
        });

        await studentAchievement.save();
      }
    }
  } catch (error) {
    console.error('Error calculating achievements:', error);
  }
};

// Get student's overall progress across all rooms
export const getStudentProgress = async (req, res) => {
  try {
    const studentId = req.user.id; // From auth middleware

    // Get all achievements for this student across all rooms
    const achievements = await StudentAchievement.find({ student: studentId })
      .populate('achievement')
      .populate('room', 'name')
      .sort({ dateEarned: -1 });

    // Calculate totals
    const totalPoints = achievements.reduce((sum, sa) => sum + sa.pointsEarned, 0);
    
    const badgeCounts = achievements.reduce((counts, sa) => {
      counts[sa.achievement.badgeColor] = (counts[sa.achievement.badgeColor] || 0) + 1;
      return counts;
    }, { bronze: 0, silver: 0, gold: 0, platinum: 0 });

    // Group achievements by room
    const achievementsByRoom = achievements.reduce((rooms, sa) => {
      const roomId = sa.room._id.toString();
      if (!rooms[roomId]) {
        rooms[roomId] = {
          room: sa.room,
          achievements: [],
          points: 0
        };
      }
      rooms[roomId].achievements.push(sa);
      rooms[roomId].points += sa.pointsEarned;
      return rooms;
    }, {});

    res.json({
      totalPoints,
      totalAchievements: achievements.length,
      badgeCounts,
      recentAchievements: achievements.slice(0, 5), // Last 5 achievements
      achievementsByRoom: Object.values(achievementsByRoom)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seed default achievements (admin only)
export const seedAchievements = async (req, res) => {
  try {
    // Clear existing achievements
    await Achievement.deleteMany({});

    const defaultAchievements = [
      // Academic Excellence
      {
        name: "First Steps",
        description: "Score your first points in any assessment",
        category: "academic",
        badgeColor: "bronze",
        badgeIcon: "Award",
        pointsRequired: 10,
        criteriaType: "total_marks",
        criteriaValue: 1
      },
      {
        name: "Good Start",
        description: "Achieve 50% average in a room",
        category: "academic",
        badgeColor: "bronze",
        badgeIcon: "Trophy",
        pointsRequired: 25,
        criteriaType: "average_marks",
        criteriaValue: 50
      },
      {
        name: "Rising Star",
        description: "Achieve 70% average in a room",
        category: "academic",
        badgeColor: "silver",
        badgeIcon: "Star",
        pointsRequired: 50,
        criteriaType: "average_marks",
        criteriaValue: 70
      },
      {
        name: "Excellence",
        description: "Achieve 85% average in a room",
        category: "academic",
        badgeColor: "gold",
        badgeIcon: "Crown",
        pointsRequired: 100,
        criteriaType: "average_marks",
        criteriaValue: 85
      },
      {
        name: "Perfectionist",
        description: "Achieve 95% average in a room",
        category: "academic",
        badgeColor: "platinum",
        badgeIcon: "Gem",
        pointsRequired: 200,
        criteriaType: "average_marks",
        criteriaValue: 95
      },
      // Participation
      {
        name: "Participant",
        description: "Complete your first assessment",
        category: "participation",
        badgeColor: "bronze",
        badgeIcon: "CheckCircle",
        pointsRequired: 15,
        criteriaType: "assessment_count",
        criteriaValue: 1
      }
    ];

    const createdAchievements = await Achievement.insertMany(defaultAchievements);
    res.json({ 
      message: "Achievements seeded successfully", 
      count: createdAchievements.length,
      achievements: createdAchievements 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
