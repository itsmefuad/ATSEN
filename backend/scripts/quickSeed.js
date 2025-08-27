// Simple script to test achievement seeding
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load .env
config();

// Simple achievement schema
const achievementSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  badgeColor: String,
  badgeIcon: String,
  pointsRequired: Number,
  criteriaType: String,
  criteriaValue: Number,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Achievement = mongoose.model('Achievement', achievementSchema);

async function quickSeed() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing
    await Achievement.deleteMany({});
    
    // Create one simple achievement
    const achievement = await Achievement.create({
      name: "First Steps",
      description: "Score your first points in any assessment", 
      category: "academic",
      badgeColor: "bronze",
      badgeIcon: "Award",
      pointsRequired: 10,
      criteriaType: "total_marks",
      criteriaValue: 1
    });
    
    console.log('Created achievement:', achievement);
    
    // Check all achievements
    const all = await Achievement.find({});
    console.log('Total achievements:', all.length);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

quickSeed();
