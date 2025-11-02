import React, { useState } from "react";
import axios from "axios";

interface Props {
    employeeId: string;
    apiUrl: string;
    onCancel: () => void;
    onCreated?: () => void;
}

interface Entry {
    date: string;
    start: string;
    end: string;
    unpaidBreakMins: number;
}

const AddTimesheetForm: React.FC<Props> = ({ employeeId, apiUrl, onCancel, onCreated }) => {
    const today = new Date().toISOString().slice(0, 10);

    const [periodStart, setPeriodStart] = useState<string>(today);
    const [periodEnd, setPeriodEnd] = useState<string>(today);
    const [entries, setEntries] = useState<Entry[]>([
        { date: today, start: "", end: "", unpaidBreakMins: 0 },
    ]);
    const [allowances, setAllowances] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateEntry = (index: number, patch: Partial<Entry>) => {
        setEntries((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], ...patch };
            return next;
        });
    };

    const addEntry = () => {
        setEntries((prev) => [...prev, { date: periodStart || today, start: "", end: "", unpaidBreakMins: 0 }]);
    };

    const removeEntry = (index: number) => {
        setEntries((prev) => prev.filter((_, i) => i !== index));
    };

    const validate = (): { ok: boolean; message?: string } => {
        if (!periodStart) return { ok: false, message: "Period start is required" };
        if (!periodEnd) return { ok: false, message: "Period end is required" };
        if (new Date(periodStart) > new Date(periodEnd)) return { ok: false, message: "Period start must be <= period end" };
        if (!entries.length) return { ok: false, message: "At least one entry is required" };

        for (let i = 0; i < entries.length; i++) {
            const e = entries[i];
            if (!e.date) return { ok: false, message: `Entry ${i + 1}: date is required` };
            if (!e.start) return { ok: false, message: `Entry ${i + 1}: start time is required` };
            if (!e.end) return { ok: false, message: `Entry ${i + 1}: end time is required` };
            if (typeof e.unpaidBreakMins !== "number" || e.unpaidBreakMins < 0) return { ok: false, message: `Entry ${i + 1}: unpaid break minutes must be >= 0` };
        }

        return { ok: true };
    };

    const create = async () => {
        const v = validate();
        if (!v.ok) {
            setError(v.message || "Validation failed");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            // Build payload according to backend model
            await axios.post(`${apiUrl}/timesheets`, {
                employeeId,
                periodStart,
                periodEnd,
                entries: entries.map((e) => ({
                    date: e.date,
                    start: e.start,
                    end: e.end,
                    unpaidBreakMins: e.unpaidBreakMins,
                })),
                allowances: allowances || 0,
            });

            onCreated && onCreated();
            onCancel();
        } catch (err) {
            console.error("Failed to create timesheet", err);
            setError("Failed to create timesheet. See console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidForSubmit = () => {
        const v = validate();
        return v.ok && !isSubmitting;
    };

    return (
        <div style={{
            marginTop: 10,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 6,
            background: "#f9f9f9",
            maxWidth: 720
        }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <label style={{ display: "flex", flexDirection: "column", minWidth: 160 }}>
                    Period Start
                    <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} style={{ padding: 6 }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", minWidth: 160 }}>
                    Period End
                    <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} style={{ padding: 6 }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", minWidth: 120 }}>
                    Allowances
                    <input type="number" min="0" step="0.01" value={allowances} onChange={(e) => setAllowances(parseFloat(e.target.value || "0"))} style={{ padding: 6 }} />
                </label>
            </div>

            <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <strong>Entries</strong>
                    <button onClick={addEntry} style={{ padding: "6px 10px", cursor: "pointer" }}>+ Add entry</button>
                </div>

                {entries.map((entry, idx) => (
                    <div key={idx} style={{ marginBottom: 8, padding: 8, border: "1px solid #eee", borderRadius: 4 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                            <label style={{ display: "flex", flexDirection: "column" }}>
                                Date
                                <input type="date" value={entry.date} onChange={(e) => updateEntry(idx, { date: e.target.value })} style={{ padding: 6 }} />
                            </label>
                            <label style={{ display: "flex", flexDirection: "column" }}>
                                Start
                                <input type="time" value={entry.start} onChange={(e) => updateEntry(idx, { start: e.target.value })} style={{ padding: 6 }} />
                            </label>
                            <label style={{ display: "flex", flexDirection: "column" }}>
                                End
                                <input type="time" value={entry.end} onChange={(e) => updateEntry(idx, { end: e.target.value })} style={{ padding: 6 }} />
                            </label>
                            <label style={{ display: "flex", flexDirection: "column" }}>
                                Unpaid break (mins)
                                <input type="number" min="0" value={entry.unpaidBreakMins} onChange={(e) => updateEntry(idx, { unpaidBreakMins: parseInt(e.target.value || "0", 10) })} style={{ padding: 6, width: 120 }} />
                            </label>
                            <button onClick={() => removeEntry(idx)} style={{ padding: "6px 8px", background: "#e74c3c", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}

            <div style={{ display: "flex", gap: 8 }}>
                <button
                    onClick={create}
                    disabled={!isValidForSubmit()}
                    style={{
                        padding: "8px 14px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: isValidForSubmit() ? "pointer" : "not-allowed",
                    }}
                >
                    {isSubmitting ? "Creating..." : "Create Timesheet"}
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        padding: "8px 14px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default AddTimesheetForm;