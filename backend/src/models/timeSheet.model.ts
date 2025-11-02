import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    unpaidBreakMins: { type: Number, required: true }
  }
);

const timesheetSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true },
    periodStart: { type: String, required: true },
    periodEnd: { type: String, required: true },
    entries: { type: [entrySchema], required: true },
    allowances: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const Timesheet = mongoose.model("Timesheet", timesheetSchema);

export default Timesheet;
