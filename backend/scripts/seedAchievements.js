import mongoose from "mongoose";
import Achievement from "../src/models/Achievement.js";
import { config } from "dotenv";

// Load environment variables
config();

const seedAchievements = async () => {
  try {
    console.log("Starting achievement seeding...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Found" : "Not found");
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log("Cleared existing achievements");

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
      },
      // More achievements with lower thresholds for easier testing
      {
        name: "Making Progress",
        description: "Achieve 30% average in a room",
        category: "academic", 
        badgeColor: "bronze",
        badgeIcon: "TrendingUp",
        pointsRequired: 15,
        criteriaType: "average_marks",
        criteriaValue: 30
      },
      {
        name: "Steady Performer",
        description: "Achieve 60% average in a room",
        category: "academic",
        badgeColor: "silver", 
        badgeIcon: "Target",
        pointsRequired: 40,
        criteriaType: "average_marks",
        criteriaValue: 60
      },
      {
        name: "High Achiever",
        description: "Achieve 80% average in a room",
        category: "academic",
        badgeColor: "gold",
        badgeIcon: "Medal",
        pointsRequired: 75,
        criteriaType: "average_marks", 
        criteriaValue: 80
      }
    ];

    const createdAchievements = await Achievement.insertMany(defaultAchievements);
    console.log(`Created ${createdAchievements.length} achievements:`);
    
    createdAchievements.forEach(achievement => {
      console.log(`- ${achievement.name} (${achievement.badgeColor}): ${achievement.description}`);
    });

  } catch (error) {
    console.error("Error seeding achievements:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
};

seedAchievements();
