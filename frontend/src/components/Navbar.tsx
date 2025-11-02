import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="app-navbar">
      <div className="nav-brand">Employee Portal</div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} end>Home</NavLink>
        <NavLink to="/employees" className={({ isActive }) => isActive ? 'active' : ''}>Employees</NavLink>
        <NavLink to="/timesheets" className={({ isActive }) => isActive ? 'active' : ''}>Timesheets</NavLink>
        <NavLink to="/payroll" className={({ isActive }) => isActive ? 'active' : ''}>Payroll</NavLink>
        <NavLink to="/payrunsummary" className={({ isActive }) => isActive ? 'active' : ''}>Payroll Summary</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;