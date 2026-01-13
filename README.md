# OCTA8: AI Interview Agent & Career Mentor

A sophisticated, voice-interactive AI platform designed to simulate realistic job interviews and provide career mentorship. Built with React, Node.js, MySQL, and local AI integration (Ollama).

## 🚀 Key Features

### 🎤 Voice-First Interaction
- **Real-time Speech-to-Text**: Converts your spoken answers into text instantly.
- **Audio Visualizer**: Dynamic visual feedback when speaking or listening.
- **Text-to-Speech**: The AI interviewer speaks back to you with a natural voice.
- **Review & Retry**: Review your transcribed answer before sending. Cancel and re-record if needed.

### 🧠 Intelligent Interviewer (OCTA8)
- **Resume-Aware**: Reads your uploaded resume (PDF) and tailors questions to your specific skills.
- **Dynamic Stages**: Successfully navigates through phases:
    1.  **Introduction**: Warm welcome and resume-based icebreakers.
    2.  **Technical Deep Dive**: Asks rigorous, comprehensive questions about specific skills, hardware, and core engineering concepts found in your resume. Avoiding generic "tell me about a project" loops.
    3.  **Behavioral/HR**: Assesses soft skills and situational judgment.
- **Context Retention**: Remembers previous answers to ask relevant follow-up questions.
- **Anti-Repetition Logic**: Explicitly designed to avoid repeating topics or questions.

### 📊 Comprehensive Evaluation
- **Instant Feedback**: Generates a detailed "Scorecard" at the end of the session.
- **Scoring**: Provides 0-10 ratings for **Technical Proficiency** and **Communication Skills**.
- **Actionable Insights**: Lists specific Strengths and Areas for Improvement based on the conversation history.

### 👥 Dual Modes
1.  **Interview Mode**: Strict, professional simulation with scoring.
2.  **Mentor Mode**: A casual, open-ended chat for career advice, resume reviews, or general tech discussions.

### 🔐 User System
- **Authentication**: Secure Login/Signup with JWT (JSON Web Tokens).
- **Session History**: Saves all past interviews and mentorship sessions. Resume previous chats anytime.
- **Dark/Light Mode**: Fully responsive UI with theme toggling.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (Stores Users, Sessions, Messages).
- **AI Engine**: Ollama (Running locally with `phi3:mini` model).
- **Security**: BCrypt for password hashing, JWT for session management.

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

1.  **Node.js** (v18 or higher)
2.  **MySQL Server** (Running locally or properly configured remote)
3.  **Ollama**: [Download Here](https://ollama.com/)
    *   Pull the required model: `ollama pull phi3:mini`

---

## ⚙️ Installation & Setup

### 1. Database Setup
Create a MySQL database and import the schema:

```sql
CREATE DATABASE interview_db;
USE interview_db;

-- (The backend will automatically create tables on start, 
-- but ensure the database exists)
```

### 2. Backend Configuration
Navigate to the `backend/` directory and create a `.env` file:

```ini
PORT=3000
DB_HOST=localhost
DB_USER=your_db_user      # e.g., root
DB_PASS=your_db_password
DB_NAME=interview_db
JWT_SECRET=your_super_secret_key_change_this
OLLAMA_HOST=http://127.0.0.1:11434
```

Install dependencies and start the server:

```bash
cd backend
npm install
node server.js
```

### 3. Frontend Configuration
Navigate to the `frontend/` directory (open a new terminal):

```bash
cd frontend
npm install
npm run dev
```

The application should now be running at `http://localhost:5173`.

---

## 📖 Usage Guide

1.  **Sign Up/Login**: Create an account to save your progress.
2.  **Dashboard**:
    *   Click **"Start New Interview"**.
    *   **Upload Resume**: Select your PDF resume.
    *   **Job Description (Optional)**: Paste the JD you are applying for.
    *   Select **Mode**: "Mock Interview" or "Career Mentor".
3.  **The Interview**:
    *   **Microphone Access**: Allow browser permission.
    *   **Speaking**: Click the **Mic Icon (🎙)**.
    *   **Reviewing**: Click **Stop (⏹)**. Read your transcript.
        *   Press **Send (➤)** to submit.
        *   Press **Retry (❌)** to discard and re-record.
4.  **Finishing**:
    *   Click "Finish Interview" to generate your **Scorecard**.
    *   Review your Technical and Communication scores.

---

## 🛑 Troubleshooting

*   **"Failed to process chat"**:
    *   Ensure Ollama is running (`ollama serve`).
    *   Check backend console for errors.
    *   Verify `phi3:mini` is pulled (`ollama list`).
*   **Database Errors**:
    *   Check your `.env` credentials.
    *   Ensure MySQL service is running.
*   **Audio Issues**:
    *   Check system microphone settings.
    *   Ensure browser permissions are granted for `localhost:5173`.

---

## 📜 License
This project is for educational and development purposes.
