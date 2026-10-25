# Practical 10: Full-Stack MERN Student Management Application

A clean, beginner-friendly Full-Stack **MERN** (**M**ongoDB Atlas, **E**xpress.js, **R**eact with Vite, **N**ode.js) Student Management System that supports creating, viewing, searching, filtering, updating, and deleting student records.

---

## Project Structure

```text
msd-prectical-10/
├── client/                         # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentForm.jsx         # Add / Edit student form with validation
│   │   │   ├── StudentList.jsx         # Responsive student table with search & filter
│   │   │   └── StudentDetailsModal.jsx # Modal to inspect full student details
│   │   ├── services/
│   │   │   └── studentApi.js           # REST API helper functions
│   │   ├── App.jsx                     # Main application state & layout
│   │   ├── main.jsx                    # React DOM entry point
│   │   └── index.css                   # Responsive styling
│   ├── .env.example                # Frontend environment variable template
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                         # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                       # Mongoose connection to MongoDB Atlas
│   ├── models/
│   │   └── Student.js                  # Mongoose Student Schema (name, email, course, semester)
│   ├── routes/
│   │   └── studentRoutes.js            # CRUD REST API routes (/api/students)
│   ├── .env.example                # Backend environment variable template
│   ├── package.json
│   └── server.js                   # Express app setup, CORS & route mounting
├── .env.example                    # Overview of environment variables
├── .gitignore                      # Excludes node_modules and .env files
└── README.md
```

---

## Features

1. **Full CRUD Operations**:
   - **Create**: Enroll new students with `name`, `email`, `course`, and `semester` (1–8).
   - **Read**: View all enrolled students in a responsive table, search by name/email/course, filter by course, or inspect individual student records in a modal.
   - **Update**: Edit existing student details directly from the table or detail modal.
   - **Delete**: Remove student records with confirmation and loading indicators.
2. **Validation & Feedback**:
   - Client-side and Mongoose schema validation for required fields, valid email format, unique emails, and semester bounds (`1` to `8`).
   - Loading spinners, disabled buttons during submission, and dismissible success/error alert banners.
3. **Security & Best Practices**:
   - Configured CORS between frontend (`http://localhost:5173`) and backend (`http://localhost:5000`).
   - Database credentials are loaded strictly via environment variables (`.env`) and excluded from Git.

---

## Prerequisites

- **Node.js** (v18 or newer recommended)
- **npm** (comes with Node.js)
- A **MongoDB Atlas** account (free tier cluster works great)

---

## MongoDB Atlas Setup

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. Go to **Database Access** and create a database user with a username and password.
3. Go to **Network Access** and click **Add IP Address** (choose **Allow Access from Anywhere** `0.0.0.0/0` for local development or add your current IP).
4. Click **Connect** on your cluster $\rightarrow$ **Drivers** $\rightarrow$ copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@<cluster-url>/student_management?retryWrites=true&w=majority
   ```

---

## Installation & Setup Instructions

### 1. Configure & Install the Backend (`server`)

Open a terminal in the project root directory and run:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder by copying `.env.example`:

- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

Open `server/.env` and replace `MONGODB_URI` with your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/student_management?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

### 2. Configure & Install the Frontend (`client`)

Open a **second terminal** in the project root directory and run:

```bash
cd client
npm install
```

(Optional) Create a `.env` file inside the `client` folder by copying `.env.example`:

- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **macOS / Linux**:
  ```bash
  cp .env.example .env
  ```

Start the React Vite development server:

```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check for the Express API |
| `GET` | `/api/students` | Get all students (newest first) |
| `GET` | `/api/students/:id` | Get a single student by ID |
| `POST` | `/api/students` | Add a new student (`{ name, email, course, semester }`) |
| `PUT` | `/api/students/:id` | Update an existing student by ID |
| `DELETE` | `/api/students/:id` | Delete a student by ID |

---

## Testing Instructions

### Testing via the React UI (`http://localhost:5173`)
1. **Validation Check**: Click **Add Student** with empty fields to verify client-side validation messages appear for Name, Email, Course, and Semester.
2. **Add Student**: Fill in a student's Name, Email, Course, and Semester (`1–8`) and submit. Verify the green success banner appears and the student is added to the table.
3. **View Student**: Click **View** on any row to open the student details modal with timestamps and MongoDB ID.
4. **Update Student**: Click **Edit** on a row, modify the semester or course, and click **Update Student**. Verify the row updates immediately.
5. **Search & Filter**: Use the search bar and course dropdown to filter students in real time.
6. **Delete Student**: Click **Delete** on a student row, confirm the prompt, and verify the student is removed.

### Testing via `curl` or Postman
- **Create a student**:
  ```bash
  curl -X POST http://localhost:5000/api/students \
    -H "Content-Type: application/json" \
    -d '{"name":"Riya Patel","email":"riya.patel@example.com","course":"B.Tech Computer Science","semester":5}'
  ```
- **Get all students**:
  ```bash
  curl http://localhost:5000/api/students
  ```
