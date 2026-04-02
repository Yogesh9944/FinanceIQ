# 💰 FinanceIQ — Personal Finance Dashboard

> A full-stack MERN application to track expenses, budgets, investments, and net worth — with an AI-style Financial Health Score.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue) ![Auth](https://img.shields.io/badge/Auth-JWT-green) ![DB](https://img.shields.io/badge/DB-MongoDB%20Atlas-brightgreen)

---

## 🚀 Live Features

| Module | What it does |
|--------|-------------|
| 💸 **Expense Tracker** | Add income/expenses, auto-categorize, filter by type |
| 🎯 **Budget Planner** | Set category limits, get real-time usage + overspend alerts |
| 📈 **Investment Tracker** | Track stocks/MF/crypto with live P&L and portfolio pie chart |
| 💎 **Net Worth** | Assets − Liabilities snapshot with history chart |
| 🧠 **Financial Health Score** | 0–100 score from savings, expenses, debt, investments |
| ⚡ **Smart Insights** | Month-over-month spending anomalies and savings analysis |

---

## 🏗️ Tech Stack

### Backend
- **Node.js + Express** — REST API
- **MongoDB Atlas** — Cloud database
- **Mongoose** — ODM
- **JWT** — Stateless authentication
- **bcryptjs** — Password hashing

### Frontend
- **React 18 + Vite** — Fast SPA
- **React Router v6** — Client-side routing
- **Recharts** — Charts (bar, pie, area, line)
- **Axios** — HTTP client with interceptors
- **Tailwind CSS** — Utility styling
- **Lucide React** — Icons

---

## 📁 Project Structure

```
finance-dashboard/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   ├── investmentController.js
│   │   └── dashboardController.js     ← Financial Score + Insights
│   ├── middleware/authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Budget.js
│   │   ├── Investment.js
│   │   └── NetWorth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   ├── budgets.js
│   │   ├── investments.js
│   │   └── dashboard.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── charts/CustomTooltip.jsx
        │   ├── layout/Sidebar.jsx
        │   ├── layout/DashboardLayout.jsx
        │   └── ui/StatCard.jsx
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx          ← Main hub
        │   ├── Transactions.jsx
        │   ├── Budgets.jsx
        │   ├── Investments.jsx
        │   ├── FinancialScore.jsx     ← USP
        │   └── NetWorth.jsx
        └── utils/
            ├── api.js                 ← Axios instance + JWT interceptor
            └── helpers.js             ← formatCurrency, getCategoryIcon, etc.
```

---

## ⚙️ Setup & Installation

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/finance-dashboard.git
cd finance-dashboard
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB Atlas URI and JWT secret in .env
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000/api/health
```

---

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + get JWT |
| GET | `/api/auth/me` | Get current user |

### Transactions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/transactions` | Add transaction |
| GET | `/api/transactions` | Get all (filterable) |
| GET | `/api/transactions/monthly-breakdown` | 6-month chart data |
| GET | `/api/transactions/category-breakdown` | Pie chart data |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Budgets
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/budgets` | Set budget (upsert) |
| GET | `/api/budgets` | Get budgets with usage % |
| DELETE | `/api/budgets/:id` | Remove budget |

### Investments
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/investments` | Add investment |
| GET | `/api/investments` | Get all + P&L summary |
| PUT | `/api/investments/:id` | Update current value |
| DELETE | `/api/investments/:id` | Remove |

### Dashboard
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard` | Full dashboard summary |
| GET | `/api/dashboard/financial-score` | **Health score (0–100)** |
| GET | `/api/dashboard/insights` | Smart insights |
| POST | `/api/dashboard/networth` | Save snapshot |
| GET | `/api/dashboard/networth` | Net worth history |

---

## 🧠 Financial Health Score — How It Works

```
Score = Savings (30) + Expense Control (25) + Debt Ratio (20) + Investment Rate (25)
```

| Factor | Weight | Formula |
|--------|--------|---------|
| Savings Rate | 30 pts | savingsRate / 30 × 30 (capped at 30%) |
| Expense Control | 25 pts | 25 if expenses < income |
| Debt Ratio | 20 pts | 20 if debt < 30% of assets, 10 if < 60% |
| Investment Rate | 25 pts | investedAmt / (income×12) × 100 |

---

## 🎨 Design

- **Theme**: Deep navy + electric blue + cyan accents
- **Typography**: Space Grotesk (headings), DM Sans (body)
- **Animations**: Staggered entry, glow pulses, smooth transitions
- **Charts**: Recharts — Bar, Pie, Area, Line
- **Glass cards** with glow-on-hover effects

---

## 📝 Interview Talking Points

> "I built a full-stack personal finance dashboard using the MERN stack where users can track expenses, set budgets per category, monitor investments across asset classes, and view their net worth over time. The standout feature is a **Financial Health Score** (0–100) computed server-side from savings rate, expense control, debt ratio, and investment behavior — with personalized feedback and smart insights that detect month-over-month spending spikes automatically."

---

## 🔐 Environment Variables

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/financeDB
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## 📦 Deployment

- **Backend**: Railway / Render / Heroku
- **Frontend**: Vercel / Netlify
- **Database**: MongoDB Atlas (free M0 tier)

Set `CLIENT_URL` in backend .env to your Vercel frontend URL for CORS.
