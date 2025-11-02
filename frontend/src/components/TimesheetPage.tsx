import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

interface TimesheetEntry {
    date: string;
    start: string;
    end: string;
    unpaidBreakMins: number;
}

interface Timesheet {
    employeeId: string;
    periodStart: string;
    periodEnd: string;
    entries: TimesheetEntry[];
    allowances: number;
}

const TimesheetPage: React.FC = () => {
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const location = useLocation();
    const id = new URLSearchParams(location.search).get("employeeId") ?? undefined;

    const url = id
        ? `http://localhost:5001/timesheets?employeeId=${encodeURIComponent(id)}`
        : "http://localhost:5001/timesheets";

    useEffect(() => {
        axios
            .get<Timesheet[]>(url)
            .then((res) => setTimesheets(res.data || []))
            .catch((err) => {
                console.error("❌ Error fetching timesheets:", err);
                setTimesheets([]);
            });
    }, [url]);

    const grouped = useMemo(() => {
        return timesheets.reduce<Record<string, Timesheet[]>>((acc, sheet) => {
            if (!acc[sheet.employeeId]) acc[sheet.employeeId] = [];
            acc[sheet.employeeId].push(sheet);
            return acc;
        }, {});
    }, [timesheets]);

    const employeeIds = Object.keys(grouped);

    return (
        <div style={{ padding: "20px" }}>
            <h2>Timesheet List</h2>

            {employeeIds.length === 0 && <p>No timesheets found.</p>}

            {employeeIds.map((employeeId) => (
                <div key={employeeId} style={{ marginBottom: "24px" }}>
                    <h3>Employee: {employeeId}</h3>
                    {grouped[employeeId].map((sheet, idx) => (
                        <div key={idx} style={{ marginBottom: "12px", paddingLeft: 8 }}>
                            <p>
                                <strong>Period:</strong> {sheet.periodStart} → {sheet.periodEnd}
                            </p>
                            <ul>
                                {sheet.entries.map((entry, i) => (
                                    <li key={i}>
                                        {entry.date}: {entry.start} - {entry.end} (Break: {entry.unpaidBreakMins} mins)
                                    </li>
                                ))}
                            </ul>
                            <p>Allowances: ₹{sheet.allowances}</p>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TimesheetPage;
