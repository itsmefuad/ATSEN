import mongoose from "mongoose";

export const connectDB = async () => {
	const primaryMongoUri = process.env.MONGO_URI;
	const fallbackMongoUri = process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/atsen";

	if (!primaryMongoUri) {
		console.warn("MONGO_URI is not set. Attempting to use local fallback database...");
		try {
			await mongoose.connect(fallbackMongoUri);
			console.log("MongoDB connected using fallback URI (local)");
			return;
		} catch (fallbackError) {
			console.error("Failed to connect to fallback MongoDB:", fallbackError);
			if (process.env.USE_MEMORY_DB === "true") {
				console.warn("Attempting to start in-memory MongoDB for development (USE_MEMORY_DB=true)...");
				try {
					const { MongoMemoryServer } = await import("mongodb-memory-server");
					const mongod = await MongoMemoryServer.create({ instance: { dbName: "atsen" } });
					const memoryUri = mongod.getUri();
					await mongoose.connect(memoryUri);
					console.log("MongoDB connected using in-memory server (development fallback)");
					process.on("SIGINT", async () => {
						await mongoose.connection.close();
						await mongod.stop();
						process.exit(0);
					});
					return;
				} catch (memoryError) {
					console.error("In-memory MongoDB startup failed:", memoryError?.message || memoryError);
				}
			}
			console.error("All database connection attempts failed. Set USE_MEMORY_DB=true to enable in-memory fallback, or start a local MongoDB instance.");
			process.exit(1);
		}
	}

	try {
		await mongoose.connect(primaryMongoUri);
		console.log("MongoDB connected using primary URI (Atlas)");
	} catch (primaryError) {
		console.error("Primary MongoDB connection failed:", primaryError?.message || primaryError);
		console.warn("Attempting to connect to fallback local MongoDB...");
		try {
			await mongoose.connect(fallbackMongoUri);
			console.log("MongoDB connected using fallback URI (local)");
		} catch (fallbackError) {
			console.error("Fallback MongoDB connection failed:", fallbackError?.message || fallbackError);
			if (process.env.USE_MEMORY_DB === "true") {
				console.warn("Attempting to start in-memory MongoDB for development (USE_MEMORY_DB=true)...");
				try {
					const { MongoMemoryServer } = await import("mongodb-memory-server");
					const mongod = await MongoMemoryServer.create({ instance: { dbName: "atsen" } });
					const memoryUri = mongod.getUri();
					await mongoose.connect(memoryUri);
					console.log("MongoDB connected using in-memory server (development fallback)");
					process.on("SIGINT", async () => {
						await mongoose.connection.close();
						await mongod.stop();
						process.exit(0);
					});
					return;
				} catch (memoryError) {
					console.error("In-memory MongoDB startup failed:", memoryError?.message || memoryError);
				}
			}
			console.error("All database connection attempts failed. Set USE_MEMORY_DB=true to enable in-memory fallback, or start a local MongoDB instance.");
			process.exit(1);
		}
	}
};
