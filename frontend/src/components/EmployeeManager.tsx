import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AddTimesheetForm from "./AddTimesheetForm";

interface Employee {
    _id?: string;
    id: string;
    name: string;
}

const EmployeeManager: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    // employee create form state
    const [id, setId] = useState<string>(""); // optional - leave empty to let backend auto-generate
    const [name, setName] = useState("");
    const [type, setType] = useState<"hourly" | "salaried">("hourly");
    const [baseHourlyRate, setBaseHourlyRate] = useState<string>("0");
    const [superRate, setSuperRate] = useState<string>("0");
    const [bankBsb, setBankBsb] = useState<string>("");
    const [bankAccount, setBankAccount] = useState<string>("");
    const [isAdding, setIsAdding] = useState(false);
    const [addError, setAddError] = useState<string | null>(null);
    const navigate = useNavigate();
    const API_URL = "http://localhost:5001";

    const [timesheetFor, setTimesheetFor] = useState<string | null>(null);
    const [tsDate, setTsDate] = useState<string>("");
    const [tsHours, setTsHours] = useState<string>("0");
    const [tsDescription, setTsDescription] = useState<string>("");
    const [tsError, setTsError] = useState<string | null>(null);
    const [isSubmittingTs, setIsSubmittingTs] = useState(false);


    // Fetch employee list
    const fetchEmployees = async () => {
        const res = await axios.get<Employee[]>(`${API_URL}/employees`);
        setEmployees(res.data);
    };

    // Add employee (front-end sends all fields)
    const addEmployee = async () => {
        setAddError(null);
        if (!name.trim()) {
            setAddError("Name is required");
            return;
        }
        const baseRateNum = parseFloat(baseHourlyRate as unknown as string);
        const superRateNum = parseFloat(superRate as unknown as string);
        if (Number.isNaN(baseRateNum) || baseRateNum < 0) {
            setAddError("baseHourlyRate must be a number >= 0");
            return;
        }
        if (Number.isNaN(superRateNum) || superRateNum < 0) {
            setAddError("superRate must be a number >= 0");
            return;
        }

        setIsAdding(true);
        try {
            const payload: any = {
                ...(id.trim() ? { id: id.trim() } : {}),
                name: name.trim(),
                type,
                baseHourlyRate: baseRateNum,
                superRate: superRateNum,
            };
            if (bankBsb.trim() || bankAccount.trim()) {
                payload.bank = {
                    ...(bankBsb.trim() ? { bsb: bankBsb.trim() } : {}),
                    ...(bankAccount.trim() ? { account: bankAccount.trim() } : {}),
                };
            }

            const res = await axios.post(`${API_URL}/employees`, payload);
            // reset form
            setId("");
            setName("");
            setType("hourly");
            setBaseHourlyRate("0");
            setSuperRate("0");
            setBankBsb("");
            setBankAccount("");
            await fetchEmployees();
        } catch (err: any) {
            console.error("Failed to add employee:", err);
            if (err?.response?.status === 409) {
                setAddError("Employee id already exists");
            } else {
                setAddError("Failed to add employee");
            }
        } finally {
            setIsAdding(false);
        }
    };

    // Delete employee
    const deleteEmployee = async (id: string) => {
        if (!id) return;
        console.log(`${API_URL}/employees/${id}`)
        await axios.delete(`${API_URL}/employees/${id}`);
        fetchEmployees();
    };

    const openTimesheetForm = (employeeId: string) => {
        setTimesheetFor(employeeId);
        setTsDate(new Date().toISOString().slice(0, 10)); // default to today
        setTsHours("0");
        setTsDescription("");
        setTsError(null);
    };

    const closeTimesheetForm = () => {
        setTimesheetFor(null);
        setTsError(null);
    };

    // Create timesheet - requires all fields
    const createTimesheet = async () => {
        if (!timesheetFor) return;
        // Validation
        if (!tsDate) {
            setTsError("Date is required");
            return;
        }
        const hoursNum = parseFloat(tsHours);
        if (Number.isNaN(hoursNum)) {
            setTsError("Hours must be a number");
            return;
        }
        if (!tsDescription.trim()) {
            setTsError("Description is required");
            return;
        }

        setTsError(null);
        setIsSubmittingTs(true);
        try {
            await axios.post(`${API_URL}/timesheets`, {
                employeeId: timesheetFor,
                date: tsDate,
                hours: hoursNum,
                description: tsDescription.trim(),
            });
            // created successfully — close form
            closeTimesheetForm();
        } catch (err) {
            console.error("Failed to create timesheet", err);
            setTsError("Failed to create timesheet. See console for details.");
        } finally {
          setIsSubmittingTs(false);
       }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    return (
        <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
            <h1>👩‍💼 Employee Manager</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "8px", marginBottom: "8px" }}>
                <input
                    placeholder="Custom id (optional)"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    style={{ padding: "8px" }}
                />
                <select value={type} onChange={(e) => setType(e.target.value as any)} style={{ padding: "8px" }}>
                    <option value="hourly">hourly</option>
                    <option value="salaried">salaried</option>
                </select>
                <input
                    placeholder="Name *"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (addError) setAddError(null);
                    }}
                    style={{ padding: "8px", gridColumn: "1 / -1" }}
                />
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="baseHourlyRate"
                    value={baseHourlyRate}
                    onChange={(e) => setBaseHourlyRate(e.target.value)}
                    style={{ padding: "8px" }}
                />
                <input
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="superRate (e.g. 0.115)"
                    value={superRate}
                    onChange={(e) => setSuperRate(e.target.value)}
                    style={{ padding: "8px" }}
                />
                <input
                    placeholder="Bank BSB"
                    value={bankBsb}
                    onChange={(e) => setBankBsb(e.target.value)}
                    style={{ padding: "8px" }}
                />
                <input
                    placeholder="Bank Account"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    style={{ padding: "8px" }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                        onClick={addEmployee}
                        disabled={isAdding || !name.trim()}
                        style={{ padding: "8px 12px" }}
                    >
                        {isAdding ? "Adding..." : "Add"}
                    </button>
                </div>
            </div>
            {addError && <div style={{ color: "red", marginBottom: 12 }}>{addError}</div>}

            <ul>
                {employees.map((emp) => (
                    <li key={emp._id} style={{ marginBottom: "8px" }}>
                        {emp.id} — {emp.name}
                        <button
                            onClick={() => deleteEmployee(emp.id)}
                            style={{
                                marginLeft: "10px",
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                cursor: "pointer",
                            }}
                        >
                            Delete
                        </button>
                       <button
                           onClick={() => openTimesheetForm(emp.id)}
                           style={{
                               marginLeft: "5px",
                               padding: "5px 12px",
                               backgroundColor: "#28a745",
                               color: "white",
                               border: "none",
                               borderRadius: "5px",
                               cursor: "pointer",
                           }}
                       >
                           Add Timesheet
                       </button>
                        <button
                            onClick={() => navigate(`/timesheets/?employeeId=${emp.id}`)}
                            style={{
                                marginLeft: "5px",
                                padding: "5px 15px",
                                backgroundColor: "#007bff", 
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Go to Timesheet
                        </button>

                       {/* AddTimesheetForm component */}
                       {timesheetFor === emp.id && (
                           <AddTimesheetForm
                               employeeId={emp.id}
                               apiUrl={API_URL}
                               onCancel={closeTimesheetForm}
                               onCreated={() => {
                                   /* optional: refresh data or show toast */
                               }}
                           />
                       )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default EmployeeManager;
