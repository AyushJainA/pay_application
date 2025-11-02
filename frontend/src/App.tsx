import React from 'react';
import './App.css';
import EmployeeManager from "./components/EmployeeManager";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TimesheetPage from './components/TimesheetPage';
import RunPayroll from './components/RunPayroll';
import Navbar from './components/Navbar';
import PayRunSummary from './components/PayRunSummary';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/employees" element={<EmployeeManager />} />
        <Route path="/payroll" element={<RunPayroll />} />
        <Route path="/timesheets" element={<TimesheetPage />} />
        <Route path="/payrunsummary" element={<PayRunSummary />} />
        <Route path="/" element={<h1>Welcome to Employee Portal</h1>} />
      </Routes>
    </Router>
  );
};

export default App;
