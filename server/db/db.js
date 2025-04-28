import mongoose from "mongoose";

async function connectToDb() {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(process.env.MONGOOSE_URI, options);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error.message);
    // Retry connection after 5 seconds
    setTimeout(connectToDb, 5000);
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected, attempting to reconnect...");
    setTimeout(connectToDb, 5000);
  });
}

export default connectToDb;
