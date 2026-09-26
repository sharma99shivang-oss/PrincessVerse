import mongoose from "mongoose";
import Message from "../models/Message.js";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "MONGODB_URI is not configured; API is running without a database connection."
    );
    return null;
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(uri);

  console.log(`MongoDB connected: ${connection.connection.host}`);

  // ✅ 24 Hours Chat Auto Delete (TTL Index)
  await Message.collection.createIndex(
    { expireAt: 1 },
    { expireAfterSeconds: 0 }
  );

  console.log("💖 Chat TTL Index Ready (24 Hours)");

  return connection;
}