import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectDB } from "../src/config/db.js";
import Student from "../src/models/student.js";
import Institution from "../src/models/institution.js";
import StudentDocument from "../src/models/StudentDocument.js";

dotenv.config();

const seedDocumentData = async () => {
  try {
    await connectDB();
    console.log("Connected to database for seeding...");

    // Create test student
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    // Find or create test student
    let testStudent = await Student.findOne({ email: "john.student@test.com" });
    if (!testStudent) {
      testStudent = await Student.create({
        name: "John Student",
        email: "john.student@test.com",
        password: hashedPassword,
        institutions: [] // Will be populated after institution creation
      });
    }

    // Find or create test institution
    let testInstitution = await Institution.findOne({ email: "test@university.edu" });
    if (!testInstitution) {
      testInstitution = await Institution.create({
        name: "Test University",
        eiin: "TEST123",
        email: "test@university.edu",
        password: hashedPassword,
        slug: "test-university",
        address: "123 University Street, Academic City",
        description: "A test university for demonstration purposes"
      });
    }

    // Associate student with institution
    if (!testStudent.institutions.includes(testInstitution._id)) {
      testStudent.institutions.push(testInstitution._id);
      await testStudent.save();
    }

    // Create sample document requests
    const documentRequests = [
      {
        documentType: "Official Transcript",
        description: "I need my official transcript for graduate school applications. Please include all completed courses with grades.",
        urgency: "Standard",
        student: testStudent._id,
        institution: testInstitution._id,
        status: "Requested"
      },
      {
        documentType: "Degree Certificate",
        description: "I require my degree certificate for job application purposes. Need it ASAP for interview process.",
        urgency: "Urgent", 
        student: testStudent._id,
        institution: testInstitution._id,
        status: "Received"
      },
      {
        documentType: "Letter of Recommendation",
        description: "I need a letter of recommendation from the Dean for scholarship application.",
        urgency: "Priority",
        student: testStudent._id,
        institution: testInstitution._id,
        status: "Approved"
      },
      {
        documentType: "Enrollment Certificate",
        description: "Current enrollment certificate needed for visa application process.",
        urgency: "Standard",
        student: testStudent._id,
        institution: testInstitution._id,
        status: "Dispatched"
      }
    ];

    // Clear existing document requests for this student
    await StudentDocument.deleteMany({ student: testStudent._id });

    // Create new document requests
    for (const docData of documentRequests) {
      const document = await StudentDocument.create(docData);
      
      // Update student and institution document arrays
      if (!testStudent.documents.includes(document._id)) {
        testStudent.documents.push(document._id);
      }
      
      if (!testInstitution.documents) {
        testInstitution.documents = [];
      }
      if (!testInstitution.documents.includes(document._id)) {
        testInstitution.documents.push(document._id);
      }
    }

    await testStudent.save();
    await testInstitution.save();

    console.log("✅ Document system seed data created successfully!");
    console.log(`📧 Test Student: ${testStudent.email} / password123`);
    console.log(`🏫 Test Institution: ${testInstitution.email} / password123`);
    console.log(`📄 Created ${documentRequests.length} sample document requests`);
    
  } catch (error) {
    console.error("❌ Error seeding document data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

// Run the seed function
seedDocumentData();
