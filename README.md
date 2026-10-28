# 💰 ExpenseEase — Personal Expense Tracker

ExpenseEase is a full-stack personal finance and expense tracking application built with a modern, decoupled architecture. It helps users record income and expenses, monitor monthly savings rates, visualize spending categories, and manage cashflow with ease.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | **React 19 + JavaScript (Vite)** | Responsive single-page application and interactive dashboard |
| **Backend** | **Python + Flask** | RESTful API service for business logic and analytics |
| **Database** | **SQLite** | Zero-configuration relational database with persistent storage |
| **Version Control** | **Git & GitHub** | Source code management and collaboration |
| **Containerization** | **Docker & Docker Compose** | Multi-container environment orchestration |
| **CI/CD** | **GitHub Actions** | Automated testing, linting, and build verification |
| **Cloud Deployment**| **AWS (EC2 / ECS / App Runner)** | Cloud hosting and production infrastructure |

---

## 🚀 Quick Start Guide

### Option 1: Running with Docker (Recommended)
You only need Docker and Docker Compose installed:

```bash
# Clone the repository
git clone https://github.com/<your-username>/ExpenseEase.git
cd ExpenseEase

# Launch both frontend and backend
docker-compose up --build
```
- Open **Frontend**: [http://localhost](http://localhost) (Port 80)
- Backend REST API: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option 2: Running Locally (Development Mode)

#### 1. Start the Flask Backend
```bash
# In one terminal
cd backend

# (Optional) create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python app.py
```
*The backend starts at `http://127.0.0.1:5000` with the SQLite database initialized at `backend/data/expenseease.db`.*

#### 2. Start the React Frontend
```bash
# In a second terminal
cd frontend

# Install packages
npm install

# Run Vite dev server
npm run dev
```
*The React app starts at `http://localhost:3000`.*

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check service health and SQLite status |
| `GET` | `/api/summary` | Analytics: totals, balance, savings rate, categories & monthly trend |
| `GET` | `/api/categories` | Fetch category list (supports `?type=income` or `?type=expense`) |
| `POST`| `/api/categories` | Add a new custom category |
| `GET` | `/api/transactions`| List transactions with filters (`type`, `category`, `search`, `start_date`, `end_date`) |
| `POST`| `/api/transactions`| Record a new income or expense |
| `GET` | `/api/transactions/<id>` | Retrieve a single transaction |
| `PUT` | `/api/transactions/<id>` | Update an existing transaction |
| `DELETE`| `/api/transactions/<id>` | Delete a transaction |

---

## 🧪 Testing

Run backend automated unit tests:
```bash
python -m unittest backend/tests/test_api.py
```

Run frontend build verification:
```bash
cd frontend
npm run build
```

---

## 📄 License
MIT License. Created for the ExpenseEase Personal Finance Project.

