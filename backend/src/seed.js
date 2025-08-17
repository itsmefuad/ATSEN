import mongoose from "mongoose";
import dotenv from "dotenv";
import Announcement from "./models/announcement.js";

dotenv.config();

const testAnnouncements = [
  {
    title: "Mid-Term Exam schedule for Summer 2025",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
    date: new Date()
  },
  {
    title: "UG 'Wishlist' Event Schedule, Fall 2025",
    content: "The Fall 2025 advising preparatory phase will begin with the upcoming 'Wishlist' event, which will help us plan course offerings for the term. All undergraduate programs will participate, except PMR.",
    date: new Date()
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB Atlas");
    
    // Clear existing announcements
    await Announcement.deleteMany({});
    console.log("Cleared existing announcements");
    
    // Insert test announcements
    await Announcement.insertMany(testAnnouncements);
    console.log("Added test announcements");
    
    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
