import express, { Request, Response } from "express";

import mongoose from "mongoose";
import cors from "cors";
import Employee from "./models/employee.model.js"; 


import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB connected asfdghgf"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));


app.get("/employees", async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

app.delete("/employees/:id", async (req: Request, res: Response) => {
  console.log("working")
try {
  const { id } = req.params;
  const e = await Employee.findOne({ id });

  res.json({ message:e});
} catch (err) {
  res.status(500).json({ error: "Failed to delete employee" });
}
});


app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Employee API is running");
}); 

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));