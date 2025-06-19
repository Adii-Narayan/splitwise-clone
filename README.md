# 💸 Splitwise Clone

A simplified expense-sharing app built with **React**, **FastAPI**, and **PostgreSQL**. Users can create groups, add expenses, and view who owes whom.

---

## 🚀 Features

- Group creation with users
- Equal and percentage-based expense splitting
- Real-time balance calculations
- Clean UI with dark mode + glowing forms

---

## 🖼️ Tech Stack

| Layer       | Technology         |
|-------------|--------------------|
| Frontend    | React + Vite + Tailwind CSS |
| Backend     | FastAPI (Python)   |
| Database    | PostgreSQL         |
| Deployment  | Vercel (frontend), Render (backend + DB) |

---

## 📦 Installation (Local Dev)

### 🔧 Backend

```bash
cd backend
python -m venv env
source env/bin/activate  # or .\env\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
