import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import Employee from "./models/employee.model.js";
import Timesheet from "./models/timeSheet.model.js";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected 11"))
  .catch((err) => console.log("MongoDB connection error:", err));


app.post("/employees", async (req: Request, res: Response) => {
  try {
    const { id, name, type, baseHourlyRate, superRate, bank } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    if (id) {
      const existing = await Employee.findOne({ id });
      if (existing) {
        return res.status(409).json({ error: "Employee id already exists" });
      }
    }

    const employee = new Employee({
      ...(id ? { id } : {}),
      name,
      ...(type ? { type } : {}),
      ...(baseHourlyRate !== undefined ? { baseHourlyRate: Number(baseHourlyRate) } : {}),
      ...(superRate !== undefined ? { superRate: Number(superRate) } : {}),
      ...(bank ? { bank } : {}),
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (err: any) {
    console.error("Failed to add employee:", err);
    if (err.code === 11000) {
      return res.status(409).json({ error: "Duplicate key error (id already exists)" });
    }
    res.status(500).json({ error: "Failed to add employee" });
  }
});

app.get("/employees", async (req: Request, res: Response) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});


app.get("/employees/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findOne({ id });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

app.delete("/employees/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedEmployee = await Employee.findOneAndDelete({ id });
    console.log("Deleting employee with id:", deletedEmployee);
    if (!deletedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    return res.status(200).json(deletedEmployee);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

app.get("/timesheets", async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.query;
    const filter = employeeId ? { employeeId } : {};
    const timesheets = await Timesheet.find(filter).populate("employeeId");

    res.status(200).json(timesheets);
  } catch (err) {
    console.error("Error fetching timesheets:", err);
    res.status(500).json({ error: err });
  }
});

app.get("/payrollByTimePeriod", async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    if (!employeeId) {
      return res.status(400).json({ error: "employeeId is required" });
    }

    const filter: any = { employeeId: String(employeeId) };

    if (startDate && endDate) {
      filter.$or = [
        { periodStart: { $gte: startDate, $lte: endDate } },
        { periodEnd: { $gte: startDate, $lte: endDate } },
        { periodStart: { $lte: startDate }, periodEnd: { $gte: endDate } },
      ];
    }

    const employee = await Employee.findOne({ id: employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const baseRate = employee.baseHourlyRate || 0;
    const timesheets = await Timesheet.find(filter);

    if (timesheets.length === 0) {
      return res.status(404).json({ error: "No timesheets found" });
    }

    const calculateHours = (start: string, end: string, breakMins: number) => {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;
      const totalMinutes = endMinutes - startMinutes - breakMins;
      return totalMinutes / 60;
    };

    const calculateTax = (gross: number) => {
      let tax = 0;
      if (gross <= 370) tax = 0;
      else if (gross <= 900) tax = (gross - 370) * 0.1;
      else if (gross <= 1500)
        tax = (900 - 370) * 0.1 + (gross - 900) * 0.19;
      else if (gross <= 3000)
        tax =
          (900 - 370) * 0.1 +
          (1500 - 900) * 0.19 +
          (gross - 1500) * 0.325;
      else if (gross <= 5000)
        tax =
          (900 - 370) * 0.1 +
          (1500 - 900) * 0.19 +
          (3000 - 1500) * 0.325 +
          (gross - 3000) * 0.37;
      else
        tax =
          (900 - 370) * 0.1 +
          (1500 - 900) * 0.19 +
          (3000 - 1500) * 0.325 +
          (5000 - 3000) * 0.37 +
          (gross - 5000) * 0.45;
      return tax;
    };

    const weeklyPayroll = timesheets.map((ts: any) => {
      const entries = ts.entries || [];

      const totalHours = entries.reduce((sum: number, entry: any) => {
        return sum + calculateHours(entry.start, entry.end, entry.unpaidBreakMins);
      }, 0);

      const normalHours = Math.min(totalHours, 38);
      const extraHours = Math.max(totalHours - 38, 0);
      const allowances = ts.allowances || 0;

      const gross =
        normalHours * baseRate + extraHours * baseRate * 1.5 + allowances;
      const tax = calculateTax(gross);
      const netPay = gross - tax;
      const superannuation = gross * 0.115;

      return {
        timesheetId: ts._id,
        employeeId,
        periodStart: ts.periodStart,
        periodEnd: ts.periodEnd,
        total_hours: totalHours.toFixed(2),
        normal_hours: normalHours.toFixed(2),
        extra_hours: extraHours.toFixed(2),
        base_rate: baseRate,
        allowances: allowances.toFixed(2),
        gross: gross.toFixed(2),
        tax: tax.toFixed(2),
        net_pay: netPay.toFixed(2),
        superannuation: superannuation.toFixed(2),
      };
    });

    const totalGross = weeklyPayroll.reduce(
      (sum, w) => sum + parseFloat(w.gross),
      0
    );
    const totalTax = weeklyPayroll.reduce(
      (sum, w) => sum + parseFloat(w.tax),
      0
    );
    const totalNetPay = weeklyPayroll.reduce(
      (sum, w) => sum + parseFloat(w.net_pay),
      0
    );
    const totalSuper = weeklyPayroll.reduce(
      (sum, w) => sum + parseFloat(w.superannuation),
      0
    );

    res.status(200).json({
      employeeId,
      totals: {
        total_gross: totalGross.toFixed(2),
        total_tax: totalTax.toFixed(2),
        total_net_pay: totalNetPay.toFixed(2),
        total_superannuation: totalSuper.toFixed(2),
      },
      payroll: weeklyPayroll,
    });
  } catch (err) {
    console.error("Error calculating payroll:", err);
    res.status(500).json({ error: "Failed to calculate payroll" });
  }
});


app.post("/timesheets", async (req: Request, res: Response) => {
  try {
    const { employeeId, periodStart, entries, allowances } = req.body;

    if (!employeeId || !periodStart || !entries) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const employee = await Employee.findOne({ id: employeeId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const startDate = new Date(periodStart);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysUntilSunday = (7 - dayOfWeek) % 7; // how many days to next Sunday
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + daysUntilSunday);

    const periodEnd = endDate.toISOString().split("T")[0]; // format as YYYY-MM-DD

    const newTimesheet = new Timesheet({
      employeeId,
      periodStart,
      periodEnd,
      entries,
      allowances,
    });

    await newTimesheet.save();

    res.status(201).json({
      message: "Timesheet created successfully",
      timesheet: newTimesheet,
    });
  } catch (err) {
    console.error("Error creating timesheet:", err);
    res.status(500).json({ error: "Failed to create timesheet" });
  }
});


app.get("/", (req: Request, res: Response) => {
  res.send("🚀 Employee API is running");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
