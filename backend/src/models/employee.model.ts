import mongoose, { Schema, model } from "mongoose";

const CounterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const Counter = model("Counter", CounterSchema);

const EmployeeSchema = new Schema({
  id: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["hourly", "salaried"],
    default: "hourly",
  },
  baseHourlyRate: {
    type: Number,
    default: 0,
  },
  superRate: {
    type: Number,
    default: 0,
  },
  bank: {
    bsb: { type: String },
    account: { type: String },
  },
});

EmployeeSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "employee_id" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // create if not exists
    );
    this.id = counter.value.toString().padStart(4, "0");
  }
  next();
});

const Employee = model("Employee", EmployeeSchema);
export default Employee;
