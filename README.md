# pay_app

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
- Node.js >= 16
- npm or yarn
- MongoDB (local or remote). You can use a cloud MongoDB or mongodb-memory-server for tests.

Environment variables (backend):
- MONGO_URI — MongoDB connection string
- PORT — server port (default: 5001)

---

## Backend — run locally
1. cd backend
2. Install: `npm install` (or `yarn`)
3. Set env (example): `export MONGO_URI="mongodb://localhost:27017/pay_app"`
4. Start: `npm start` or `npm run dev` (depending on scripts)

Common routes:
- GET /employees — list employees
- POST /employees — create employee (body: { id?, name, type, baseHourlyRate, superRate, bank })
- DELETE /employees/:id — delete employee
- GET /timesheets — list timesheets (optional query params)
- POST /timesheets — create timesheet
- GET /payrollByTimePeriod?employeeId=ID&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD — payroll for range (both dates inclusive)
- POST /runPay — (alternative endpoint) run payroll (if implemented)

Example:
```
curl "http://localhost:5001/payrollByTimePeriod?employeeId=e-alice&startDate=2025-10-01&endDate=2025-10-15"
```

---

## Frontend — run locally
1. cd frontend
2. Install: `npm install` (or `yarn`)
3. Start dev server: `npm start` (or `yarn start`)
4. App runs on `http://localhost:3000` (default CRA port)

Key UI:
- Employee Manager — add employee (full fields), add timesheet per employee
- Timesheet Page — view timesheets grouped by employee
- Run Payroll / Pay Run Summary — select employee or week and run payroll; displays totals

---

## Data model (summary)
Employee example:
```json
{
  "id": "e-alice",
  "name": "Alice",
  "type": "hourly",
  "baseHourlyRate": 35.0,
  "superRate": 0.115,
  "bank": { "bsb": "083-123", "account": "12345678" }
}
```

Timesheet (high-level):
- employeeId
- periodStart (YYYY-MM-DD)
- periodEnd (YYYY-MM-DD)
- entries: [{ date, start, end, unpaidBreakMins }]
- allowances (number)

Payroll response (example totals returned by `/payrollByTimePeriod`):
```json
{
  "employeeId": "0012",
  "totals": {
    "total_gross": "11620.00",
    "total_tax": "3518.00",
    "total_net_pay": "8102.00",
    "total_superannuation": "1336.30"
  },
  "payroll": [ /* per-timesheet details */ ]
}
```

---

## Tests
- Backend tests use Jest + Supertest (optionally mongodb-memory-server).
- Run tests from backend: `npm test` (ensure test scripts configured).

---

## Notes & tips
- Ensure `.env` (MONGO_URI) is set before starting backend.
- The frontend calls backend at `http://localhost:5001` by default; change API URL in frontend config if needed.
- Use the Pay Run Summary UI to run payroll for a Monday→Sunday week; start must be Monday and end must be Sunday.

---

If you want, I can:
- Add README run scripts to package.json for both packages
- Add example .env.example
- Add minimal API docs (OpenAPI) for the backend
```// filepath: /home/ayush/ayush/pay/pay_app/README.md
# pay_app

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
- Node.js >= 16
- npm or yarn
- MongoDB (local or remote). You can use a cloud MongoDB or mongodb-memory-server for tests.

Environment variables (backend):
- MONGO_URI — MongoDB connection string
- PORT — server port (default: 5001)

---

## Backend — run locally
1. cd backend
2. Install: `npm install` (or `yarn`)
3. Set env (example): `export MONGO_URI="mongodb://localhost:27017/pay_app"`
4. Start: `npm start` or `npm run dev` (depending on scripts)

Common routes:
- GET /employees — list employees
- POST /employees — create employee (body: { id?, name, type, baseHourlyRate, superRate, bank })
- DELETE /employees/:id — delete employee
- GET /timesheets — list timesheets (optional query params)
- POST /timesheets — create timesheet
- GET /payrollByTimePeriod?employeeId=ID&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD — payroll for range (both dates inclusive)
- POST /runPay — (alternative endpoint) run payroll (if implemented)

Example:
```
curl "http://localhost:5001/payrollByTimePeriod?employeeId=e-alice&startDate=2025-10-01&endDate=2025-10-15"
```

---

## Frontend — run locally
1. cd frontend
2. Install: `npm install` (or `yarn`)
3. Start dev server: `npm start` (or `yarn start`)
4. App runs on `http://localhost:3000` (default CRA port)

Key UI:
- Employee Manager — add employee (full fields), add timesheet per employee
- Timesheet Page — view timesheets grouped by employee
- Run Payroll / Pay Run Summary — select employee or week and run payroll; displays totals

---

## Data model (summary)
Employee example:
```json
{
  "id": "e-alice",
  "name": "Alice",
  "type": "hourly",
  "baseHourlyRate": 35.0,
  "superRate": 0.115,
  "bank": { "bsb": "083-123", "account": "12345678" }
}
```

Timesheet (high-level):
- employeeId
- periodStart (YYYY-MM-DD)
- periodEnd (YYYY-MM-DD)
- entries: [{ date, start, end, unpaidBreakMins }]
- allowances (number)

Payroll response (example totals returned by `/payrollByTimePeriod`):
```json
{
  "employeeId": "0012",
  "totals": {
    "total_gross": "11620.00",
    "total_tax": "3518.00",
    "total_net_pay": "8102.00",
    "total_superannuation": "1336.30"
  },
  "payroll": [ /* per-timesheet details */ ]
}
```

---

## Tests
- Backend tests use Jest + Supertest (optionally mongodb-memory-server).
- Run tests from backend: `npm test` (ensure test scripts configured).

---

## Notes & tips
- Ensure `.env` (MONGO_URI) is set before starting backend.
- The frontend calls backend at `http://localhost:5001` by default; change API URL in frontend config if needed.
- Use the Pay Run Summary UI to run payroll for a Monday→Sunday week; start must be Monday and end must be Sunday.

---

If you want, I can:
- Add README run scripts to package.json for both packages
- Add example .env.example
- Add minimal API docs (OpenAPI)