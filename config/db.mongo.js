import mongoose from "mongoose";
import { MONGO_URI } from "../env.js";

export const connectToMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        mongoose.connection.on("error", (err) =>
            console.error("MongoDB connection error:", err)
        );
        mongoose.connection.on("disconnected", () =>
            console.log("MongoDB disconnected")
        );

        // shutdown gracefully
        const gracefulShutdown = async () => {
            await mongoose.disconnect();
            console.log("MongoDB connection closed");
            process.exit(0);
        };
        process.on("SIGINT", gracefulShutdown);
        process.on("SIGTERM", gracefulShutdown);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};
