import React, { useEffect, useState } from "react";
import axios from "axios";

interface Employee {
  _id?: string;
  id: string;
  name: string;
}

interface Totals {
  total_gross: string;
  total_tax: string;
  total_net_pay: string;
  total_superannuation: string;
}

const API_URL = "http://localhost:5001";

const RunPayroll: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);

  useEffect(() => {
    axios
      .get<Employee[]>(`${API_URL}/employees`)
      .then((r) => setEmployees(r.data || []))
      .catch((e) => console.error("Failed to fetch employees", e));
  }, []);

  const runPayroll = async () => {
    setError(null);
    setTotals(null);
    if (!employeeId) return setError("Select an employee");
    if (!startDate || !endDate) return setError("Start date and end date are required");
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/payrollByTimePeriod`, {
        params: { employeeId, startDate, endDate },
      });
      setTotals(res.data.totals ?? null);
    } catch (err: any) {
      console.error("Run payroll error", err);
      setError(err?.response?.data?.error || "Failed to run payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 640 }}>
      <h3>Run Payroll</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Employee
          <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} style={{ padding: 8 }}>
            <option value="">-- select employee --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.id})
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            Start Date
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: 8 }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            End Date
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: 8 }} />
          </label>
        </div>
      </div>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <div style={{ marginBottom: 16 }}>
        <button onClick={runPayroll} disabled={loading} style={{ padding: "8px 14px" }}>
          {loading ? "Running..." : "Run Payroll"}
        </button>
      </div>

      {totals && (
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 6, maxWidth: 420 }}>
          <h4>Totals</h4>
          <div>Total gross: {totals.total_gross}</div>
          <div>Total tax: {totals.total_tax}</div>
          <div>Total net pay: {totals.total_net_pay}</div>
          <div>Total superannuation: {totals.total_superannuation}</div>
        </div>
      )}
    </div>
  );
};

export default RunPayroll;