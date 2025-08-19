import mongoose from "mongoose";

function logMongoDetails(label) {
	const { host, name, port, user } = mongoose.connection;
	console.log(`${label}:`, { host, db: name, port, user: user || undefined });
}

export const connectDB = async () => {
	const primaryMongoUri = process.env.MONGO_URI;
	const fallbackMongoUri = process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/atsen";

	if (!primaryMongoUri) {
		console.warn("MONGO_URI is not set. Attempting to use local fallback database...");
		try {
			await mongoose.connect(fallbackMongoUri);
			console.log("MongoDB connected using fallback URI (local)");
			logMongoDetails("Mongo connection");
			return;
		} catch (fallbackError) {
			console.error("Failed to connect to fallback MongoDB:", fallbackError);
			console.error("Please start a local MongoDB instance or set MONGO_URI for Atlas connection.");
			process.exit(1);
		}
	}

	try {
		await mongoose.connect(primaryMongoUri);
		console.log("MongoDB connected using primary URI (Atlas)");
		logMongoDetails("Mongo connection");
	} catch (primaryError) {
		console.error("Primary MongoDB connection failed:", primaryError?.message || primaryError);
		console.warn("Attempting to connect to fallback local MongoDB...");
		try {
			await mongoose.connect(fallbackMongoUri);
			console.log("MongoDB connected using fallback URI (local)");
			logMongoDetails("Mongo connection");
		} catch (fallbackError) {
			console.error("Fallback MongoDB connection failed:", fallbackError?.message || fallbackError);
			console.error("All database connection attempts failed. Please start a local MongoDB instance.");
			process.exit(1);
		}
	}
};
