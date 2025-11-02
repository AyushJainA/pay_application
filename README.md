# pay_application

## Overview
Monorepo containing a backend (Express + Mongoose) and a frontend (React + TypeScript).  
Backend exposes APIs for employees, timesheets and payroll calculations. Frontend contains components to manage employees, add timesheets and run pay runs.

---

## Layout
- backend/ — Express server, Mongoose models, routes
  - src/
    - server.ts
    - models/employee.model.ts
    - models/timeSheet.model.ts
- frontend/ — React (TypeScript) app
  - src/
    - components/
      - EmployeeManager.tsx
      - AddTimesheetForm.tsx
      - TimesheetPage.tsx
      - RunPayroll.tsx
      - PayRunSummary.tsx

---

## Prerequisites
- Node.js 
- npm or yarn
- MongoDB (local or remote). You can use a cloud MongoDB or mongodb-memory-server for tests.

Environment variables (backend):
- MONGO_URI — MongoDB connection string
- PORT — server port (default: 5001)

---

## Backend

Common routes:
- GET /employees — list employees
- POST /employees — create employee (body: { id?, name, type, baseHourlyRate, superRate, bank })
- DELETE /employees/:id — delete employee
- GET /timesheets — list timesheets (optional query params)
- POST /timesheets — create timesheet
- GET /payrollByTimePeriod?employeeId=ID&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD — payroll for range (both dates inclusive)
- POST /runPay — (alternative endpoint) run payroll (if implemented)

---

## Frontend

Key UI:
- Employee Manager — add employee (full fields), add timesheet per employee
- Timesheet Page — view timesheets grouped by employee
- Run Payroll / Pay Run Summary — select employee or week and run payroll; displays totals

---

## Setting Up

Clone the project:

```bash
  git clone https://github.com/AyushJainA/pay_application.git
```

Change Directory:

```bash
  cd pay_application
```
## Frontend 

Change Directory:

```bash
  cd frontend
```

Install dependencies:

```bash
  npm install
```

```bash
  npm init -y
```

```bash
  npm install react react-dom react-router-dom typescript axios nodemon
```

```bash
  create .env and add 
  PORT = 3001
```

```bash
  npm start
```

## Backend 

Change Directory:

```bash
  cd ..
```

```bash
  cd backend
```

```bash
  npm install
```

```bash
  npm init -y
```

```bash
  npm install mongoose express dotenv cors nodemon
```

```bash
  create .env and add 
  PORT = 5001
  MONGO_URI = link of mongo
```
```bash
  npm run dev or nodemon --exec tsx src/server.ts
```
