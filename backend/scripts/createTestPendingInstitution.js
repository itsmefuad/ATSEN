// Test script to create a pending institution request
import mongoose from "mongoose";
import PendingInstitute from "../src/models/PendingInstitute.js";

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://ibraheem:mongodb23412@cluster0.stpz32p.mongodb.net/atsen_db?retryWrites=true&w=majority&appName=Cluster0");

async function createTestPendingInstitution() {
  try {
    const testInstitution = await PendingInstitute.create({
      name: "Test University",
      eiin: "TEST001",
      email: "test@university.edu",
      password: "testpassword123",
      phone: "+1234567890",
      address: "123 Education Street, Academic City",
      description: "A test university for demonstrating the approval system"
    });

    console.log("✅ Test pending institution created:");
    console.log("ID:", testInstitution._id);
    console.log("Name:", testInstitution.name);
    console.log("EIIN:", testInstitution.eiin);
    console.log("Status:", testInstitution.status);
    
  } catch (error) {
    console.error("❌ Error creating test institution:", error.message);
  }
  
  mongoose.connection.close();
}

createTestPendingInstitution();
