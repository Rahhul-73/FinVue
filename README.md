# 💰 FinVue | Personal Finance Tracker

FinVue is a premium, secure, and intuitive personal finance tracking application designed with React, Node.js, Express, and MongoDB. It allows users to record, categorize, and analyze expenses, set budget limits, and receive smart visual statistics and financial tips.

---

## 🌟 Key Features

- **Dynamic Financial Dashboard:** View metrics (Total Spend, Budgets Set, Compliance Rating, Top Spending Category) and check recent activities in one interface.
- **Budget Limits & Warnings:** Define category-specific monthly spending ceilings. The app shifts progress indicators from green (safe) to amber (warning) and pulsing red (exceeded) with warning notifications.
- **Interactive Visual Analytics:** Powered by `Recharts` to display category allocations (Pie Chart) and 6-month aggregate spending vs budget trends (Area Chart).
- **Financial Advisor Insight:** Dynamic warnings and savings suggestions based on your category utilization.
- **Robust CRUD Operations:** Search, sort, paginate, add, edit, and delete individual expense transactions.
- **High Security Architecture:** Shielded endpoints protecting user records.
- **Premium Glassmorphic Design:** Smooth transitions, Outfit & Inter fonts, and a responsive toggle supporting default High-contrast Dark Mode and soft-shadow Light Mode.

---

## 🛡️ Security Mechanisms

- **JWT Auth via HttpOnly Cookies:** User sessions are stored in JWT tokens inside `HttpOnly; SameSite=Lax` cookies, preventing client-side script token theft (mitigating XSS).
- **Brute Force Rate Limiting:** Enforces `express-rate-limit` on authentication endpoints (register/login) to prevent brute-force attacks.
- **Security Headers:** Enforces `helmet` configuration to manage Content-Security-Policy (CSP) and mitigate clickjacking or MIME-sniffing.
- **Border Validations & Sanitizations:** Employs `express-validator` to sanitize, type-check, and escape strings at the router edge, preventing MongoDB query injections.
- **CORS Configuration:** Transmits cookie data strictly to allowed local domains.

---

## 🔌 In-Memory Mock Database Fallback

If local MongoDB database is not running or connection fails, the server automatically boots into **Mock Database Fallback Mode**.
- It creates an in-memory repository mimicking Mongoose models.
- It seeds demo records and a profile so you can test the web app immediately without database configurations.
- Default Mock login: **`demo@example.com`** / **`password123`**

---

## 📂 Project Structure

```
CBIT/
├── backend/
│   ├── config/          # DB connection and Mock DB fallback
│   ├── middleware/      # JWT verification, rate limiting, validation rules
│   ├── models/          # Mongoose Schemas (User, Expense, Budget)
│   ├── controllers/     # Authentication, CRUD, Aggregations controllers
│   ├── routes/          # Express route bindings
│   ├── server.js        # Express application setup
│   └── .env             # Port and variables configuration
└── frontend/
    ├── src/
    │   ├── components/  # Modals, Navbar, Category progress, Charts
    │   ├── context/     # Auth Context and Theme Context
    │   ├── pages/       # Dashboard, Ledgers, Budgets, Charts, Login, Register
    │   ├── styles/      # Vanilla HSL design tokens, global resets, pages styles
    │   ├── App.jsx      # React router configuration
    │   └── main.jsx     # Root mount point
    ├── index.html
    └── vite.config.js   # Vite proxy routing configurations
```

---

## 🚀 Setup & Launch Instructions

To launch the project locally:

### 1. Prerequisite Installations
Ensure Node.js is installed. (Optionally start MongoDB locally on port `27017` to test with a database, otherwise the Mock database will automatically take over).

### 2. Launch the Backend Server
Open a terminal window and execute:
```bash
cd backend
npm install
npm start
```
*The server will boot on port `5001`.*

### 3. Launch the Frontend Vite Server
Open a second terminal window and execute:
```bash
cd frontend
npm install
npm run dev
```
*Vite will compile files and listen on port `5173`.*

### 4. Open in Browser
Visit **[http://localhost:5173](http://localhost:5173)**.
- If using MongoDB, create an account using the register panel.
- If using Mock DB, sign in using:
  - **Email:** `demo@example.com`
  - **Password:** `password123`
