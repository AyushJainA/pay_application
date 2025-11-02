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

interface EmployeePayroll {
  employeeId: string;
  name: string;
  totals: Totals;
}

const API_URL = "http://localhost:5001";

const isMonday = (isoDate: string) => new Date(isoDate).getDay() === 1;
const isSunday = (isoDate: string) => new Date(isoDate).getDay() === 0;

const PayRunSummary: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<EmployeePayroll[]>([]);

  useEffect(() => {
    axios
      .get<Employee[]>(`${API_URL}/employees`)
      .then((r) => setEmployees(r.data || []))
      .catch((e) => console.error("Failed to fetch employees", e));
  }, []);

  const validateRange = (): string | null => {
    if (!startDate || !endDate) return "Start date and end date are required.";
    if (!isMonday(startDate)) return "Start date must be a Monday.";
    if (!isSunday(endDate)) return "End date must be a Sunday.";
    if (new Date(startDate) > new Date(endDate)) return "Start date must be <= end date.";
    // ensure exactly 6 days between (optional): period should be Monday..Sunday (inclusive)
    const diffDays = (Date.parse(endDate) - Date.parse(startDate)) / (1000 * 60 * 60 * 24);
    if (diffDays !== 6) return "Start and end must span a single week (Monday → Sunday).";
    return null;
  };

  const runSummary = async () => {
    setError(null);
    setResults([]);
    const v = validateRange();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);

    try {
      const promises = employees.map((emp) =>
        axios.get(`${API_URL}/payrollByTimePeriod`, {
          params: { employeeId: emp.id, startDate, endDate },
        }).then((res) => ({ emp, data: res.data }))
      );

      const settled = await Promise.allSettled(promises);

      const found: EmployeePayroll[] = [];
      for (const s of settled) {
        if (s.status === "fulfilled") {
          const { emp, data } = s.value as any;
          if (data && data.totals) {
            found.push({
              employeeId: emp.id,
              name: emp.name,
              totals: data.totals as Totals,
            });
          }
        } else {
          // ignore employees with no timesheets (404) or other errors
          // optionally log:
          // console.warn("payroll error for employee", s.reason);
        }
      }

      if (found.length === 0) {
        setError("No payroll records found for any employee in this period.");
      }
      setResults(found);
    } catch (err: any) {
      console.error("Run summary error", err);
      setError("Failed to fetch pay run summary.");
    } finally {
      setLoading(false);
    }
  };

  const aggregateTotals = () => {
    const agg = results.reduce(
      (acc, r) => {
        acc.total_gross += parseFloat(r.totals.total_gross);
        acc.total_tax += parseFloat(r.totals.total_tax);
        acc.total_net_pay += parseFloat(r.totals.total_net_pay);
        acc.total_superannuation += parseFloat(r.totals.total_superannuation);
        return acc;
      },
      { total_gross: 0, total_tax: 0, total_net_pay: 0, total_superannuation: 0 }
    );
    return {
      total_gross: agg.total_gross.toFixed(2),
      total_tax: agg.total_tax.toFixed(2),
      total_net_pay: agg.total_net_pay.toFixed(2),
      total_superannuation: agg.total_superannuation.toFixed(2),
    } as Totals;
  };

  return (
    <div style={{ padding: 20, maxWidth: 900 }}>
      <h3>Pay Run Summary</h3>

      <div style={{ marginBottom: 12, color: "#555" }}>
        Enter a week range (Start = Monday, End = Sunday). Results will include employees with timesheets in that period.
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <label style={{ display: "flex", flexDirection: "column" }}>
          Start (Monday)
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: 8 }} />
        </label>
        <label style={{ display: "flex", flexDirection: "column" }}>
          End (Sunday)
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: 8 }} />
        </label>
        <button onClick={runSummary} disabled={loading} style={{ padding: "8px 14px", height: 40 }}>
          {loading ? "Running..." : "Run Summary"}
        </button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      {results.length > 0 && (
        <>
          <div style={{ marginBottom: 12 }}>
            <strong>Per-employee totals:</strong>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {results.map((r) => (
              <div key={r.employeeId} style={{ border: "1px solid #ddd", padding: 10, borderRadius: 6 }}>
                <div style={{ fontWeight: 600 }}>{r.name} ({r.employeeId})</div>
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  <div>Total gross: {r.totals.total_gross}</div>
                  <div>Total tax: {r.totals.total_tax}</div>
                  <div>Total net pay: {r.totals.total_net_pay}</div>
                  <div>Total super: {r.totals.total_superannuation}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 12 }}>
            <strong>Aggregate totals:</strong>
            <div style={{ marginTop: 8 }}>
              {(() => {
                const agg = aggregateTotals();
                return (
                  <div style={{ display: "flex", gap: 12 }}>
                    <div>Gross: {agg.total_gross}</div>
                    <div>Tax: {agg.total_tax}</div>
                    <div>Net: {agg.total_net_pay}</div>
                    <div>Super: {agg.total_superannuation}</div>
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PayRunSummary;