import mongoose from "mongoose";

function logMongoDetails(label) {
	const { host, name, port, user } = mongoose.connection;
	console.log(`${label}:`, { host, db: name, port, user: user || undefined });
}

export const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI;

	if (!mongoUri) {
		console.error("MONGO_URI environment variable is required for MongoDB Atlas connection.");
		console.error("Please set MONGO_URI in your .env file.");
		process.exit(1);
	}

	try {
		await mongoose.connect(mongoUri);
		console.log("MongoDB Atlas connected successfully");
		logMongoDetails("MongoDB Atlas connection");
	} catch (error) {
		console.error("Failed to connect to MongoDB Atlas:", error?.message || error);
		console.error("Please check your MONGO_URI and ensure MongoDB Atlas is accessible.");
		process.exit(1);
	}
};
