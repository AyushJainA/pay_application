import mongoose from "mongoose";

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
