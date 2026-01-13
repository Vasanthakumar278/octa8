const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const N8N_HOST = process.env.N8N_HOST || 'http://localhost:5678';
// n8n is running on host machine, so use host.docker.internal if in docker, or just localhost
const OLLAMA_HOST = 'http://localhost:11434';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
app.use(cors());
app.use(express.json());

// File Upload Setup
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Utility to clean AI responses
 */
function cleanAiResponse(text) {
    if (!text) return '';
    let cleaned = text;

    // Remove surrounding quotes (single or double)
    cleaned = cleaned.replace(/^["'](.*)["']$/s, '$1');

    cleaned = cleaned.replace(/---+\s*###\s*Instruction with Added Complexity.*/gi, '');
    cleaned = cleaned.replace(/Difficulty Level:.*/gi, '');
    cleaned = cleaned.replace(/^(Question|Interviewer|Response|AI|Assistant|Interviewer Assistant):\s*/i, '');
    cleaned = cleaned.replace(/\n(Question|Interviewer|Response|AI|Assistant|Interviewer Assistant):\s*/gi, ' ');
    cleaned = cleaned.replace(/Interviewer's Next Question.*/gi, '');
    cleaned = cleaned.replace(/Phase: (TECH|HR).*/gi, '');
    cleaned = cleaned.replace(/Based on Phase:.*/gi, '');
    cleaned = cleaned.replace(/In this instruction set,.*/gi, '');
    cleaned = cleaned.replace(/I've created an interviewer persona.*/gi, '');
    cleaned = cleaned.replace(/Understood!.*/gi, '');
    cleaned = cleaned.replace(/\(Note:.*/gi, '');
    cleaned = cleaned.replace(/Now, please answer.*/gi, '');
    cleaned = cleaned.replace(/Candidate:.*/gi, '');

    // Only remove dashes if they are at the very end followed by specific instruction junk
    // This prevents cutting off scorecards that might use dashes as separators
    if (cleaned.includes('[SCORECARD]') || cleaned.includes('Technical Score:')) {
        cleaned = cleaned.replace(/-{3,}\s*###\s*Instruction.*/gi, '');
    } else {
        cleaned = cleaned.replace(/-{3,}[\s\S]*/, '');
    }

    return cleaned.trim();
}

/**
 * Auth Middleware
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- AUTHENTICATION ROUTES ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        res.status(201).json({ message: 'User created', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username already exists' });
        res.status(500).json({ error: 'Signup failed', details: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username, userId: user.id });
    } catch (error) {
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

// --- SESSION MANAGEMENT ROUTES ---

// Get User Sessions
app.get('/api/sessions', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY updated_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sessions:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get Session Details/History
app.get('/api/session/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const [sessionRows] = await pool.execute(
            'SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?',
            [sessionId, req.user.id]
        );

        if (sessionRows.length === 0) return res.status(404).json({ error: 'Session not found' });

        const session = sessionRows[0];

        const [messages] = await pool.execute(
            'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC',
            [sessionId]
        );

        // Map messages to frontend format
        const history = messages.map(msg => ({
            sender: msg.sender,
            text: msg.message_text
        }));

        res.json({ session, history });
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ error: 'Failed to fetch session details' });
    }
});

// Delete Session
app.delete('/api/session/:sessionId', authenticateToken, async (req, res) => {
    const { sessionId } = req.params;
    console.log(`🗑️ DELETE request received for session: ${sessionId} by user: ${req.user.id}`);

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verify ownership and existence
        const [sessionRows] = await connection.execute(
            'SELECT id FROM interview_sessions WHERE id = ? AND user_id = ?',
            [sessionId, req.user.id]
        );

        console.log(`🔍 Session found in DB: ${sessionRows.length > 0}`);
        if (sessionRows.length === 0) {
            await connection.rollback();
            console.warn(`⚠️ Session ${sessionId} not found or unauthorized for user ${req.user.id}`);
            return res.status(404).json({ error: 'Session not found or unauthorized' });
        }

        // 2. Delete messages first (FK constraint)
        const [msgResult] = await connection.execute('DELETE FROM messages WHERE session_id = ?', [sessionId]);
        console.log(`✅ ${msgResult.affectedRows} messages for session ${sessionId} deleted`);

        // 3. Delete session
        const [sessionResult] = await connection.execute('DELETE FROM interview_sessions WHERE id = ?', [sessionId]);
        console.log(`✅ Session ${sessionId} deleted from interview_sessions (Affected: ${sessionResult.affectedRows})`);

        await connection.commit();
        res.json({
            message: 'Session deleted successfully',
            details: {
                messagesDeleted: msgResult.affectedRows,
                sessionDeleted: sessionResult.affectedRows === 1
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('❌ Error deleting session:', error);
        res.status(500).json({ error: 'Failed to delete session', details: error.message });
    } finally {
        connection.release();
    }
});

// --- INTERVIEW ROUTES ---

// 1. Init Interview
app.post('/api/init', authenticateToken, upload.single('resume'), async (req, res) => {
    try {
        const jobDescription = req.body.jobDescription || '';
        const mode = req.body.mode || 'interview';
        const sessionId = Date.now().toString(); // Use timestamp as basic ID
        const userId = req.user.id;

        // Parse PDF
        let resumeText = '';
        if (req.file) {
            try {
                const pdfData = await pdfParse(req.file.buffer);
                resumeText = pdfData.text;
            } catch (pdfError) {
                resumeText = `Resume File: ${req.file.originalname}. [Content parsing failed]`;
            }
        } else if (req.body.resumeText) {
            resumeText = req.body.resumeText;
        } else {
            // Check if user has a previous recent session we could use? 
            // For now, just require resume if starting fresh
            return res.status(400).json({ error: 'No resume provided' });
        }

        // Save Session to MySQL
        await pool.execute(
            'INSERT INTO interview_sessions (id, user_id, mode, resume_text, job_description, stage, question_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sessionId, userId, mode, resumeText, jobDescription, 'HR', mode === 'interview' ? 1 : 0]
        );

        // Call Ollama
        const ollamaUrl = `${OLLAMA_HOST}/api/generate`;
        let prompt = '';

        if (mode === 'mentor') {
            prompt = `You are OCTA8, a Career Mentor.
CONTEXT:
Candidate Resume: ${resumeText.substring(0, 2000)}
Job Description: ${jobDescription.substring(0, 1000)}
TASK:
Welcome the user briefly.
- Be straight to the point.
- MAX 1-2 short sentences.`;
        } else {
            prompt = `Generate a brief welcome for an interview candidate (1 sentence only).
Do NOT ask any questions. Just welcome them.

EXAMPLE:
"Welcome! I'm excited to speak with you today."

YOUR WELCOME (1 sentence):`;
        }

        const ollamaResponse = await axios.post(ollamaUrl, {
            model: 'phi3:mini',
            prompt: prompt,
            stream: false,
            options: {
                stop: ["Candidate:", "User:", "Answer:", "Now, please answer", "Observation:", "\n\n", "Interviewer:"]
            }
        }, { timeout: 120000 });

        let aiReply = cleanAiResponse(ollamaResponse.data.response);

        // For interview mode, append the standard opening question
        if (mode === 'interview') {
            aiReply = aiReply + " Tell me about yourself.";
        }

        // Save Initial AI Message
        await pool.execute(
            'INSERT INTO messages (session_id, sender, message_text) VALUES (?, ?, ?)',
            [sessionId, 'ai', aiReply]
        );

        res.json({ message: aiReply, sessionId: sessionId });

    } catch (error) {
        console.error('Error in /api/init:', error);
        res.status(500).json({ error: 'Failed to initialize interview', details: error.message });
    }
});

// 2. Chat
app.post('/api/chat', authenticateToken, async (req, res) => {
    try {
        const { message, sessionId, mode } = req.body;
        if (!message) return res.status(400).json({ error: 'Message required' });

        // Retrieve Session
        const [sessionRows] = await pool.execute('SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?', [sessionId, req.user.id]);
        let session = sessionRows[0];

        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Retrieve History
        const [historyRows] = await pool.execute('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC', [sessionId]);
        const fullConversation = historyRows.map(row => `${row.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${row.message_text}`).join('\n');

        // Save User Message
        await pool.execute('INSERT INTO messages (session_id, sender, message_text) VALUES (?, ?, ?)', [sessionId, 'user', message]);

        const ollamaUrl = `${OLLAMA_HOST}/api/generate`;
        let prompt = '';

        if (session.mode === 'mentor') {
            prompt = `You are OCTA8, a Career Mentor helping a candidate.

CONTEXT:
Candidate Resume: ${session.resume_text.substring(0, 1500)}
Target Job: ${session.job_description.substring(0, 500)}
Conversation History:
${fullConversation}

USER'S QUESTION: "${message}"

CRITICAL INSTRUCTIONS:
1. ANSWER the user's question directly. DO NOT ask questions back.
2. Provide helpful, actionable information.
3. Be concise (2-4 sentences or bullet points).
4. Use the resume/job context ONLY if relevant.

EXAMPLE:
If asked "tell about fullstack development", respond with:
"Fullstack development involves working on both frontend (user interface) and backend (server, database) of applications. Key skills include:
• Frontend: HTML, CSS, JavaScript frameworks (React, Vue)
• Backend: Server languages (Node.js, Python), databases (SQL, MongoDB)
• DevOps: Deployment, CI/CD, cloud platforms
It requires understanding the complete application lifecycle."

YOUR ANSWER (no questions, just helpful information):`;
        } else {
            // Interview Mode Logic
            const MAX_QUESTIONS = 10;
            let newCount = session.question_count + 1;
            let newStage = session.stage;

            if (newStage === 'HR' && newCount > 3) newStage = 'TECH';

            // Update Session State
            await pool.execute('UPDATE interview_sessions SET question_count = ?, stage = ? WHERE id = ?', [newCount, newStage, sessionId]);

            const isEnd = newCount > MAX_QUESTIONS || message.toLowerCase().includes('finish') || message.toLowerCase().includes('stop interview');

            let instructions = "";
            let example = "";

            if (newStage === 'TECH') {
                instructions = `3. Ask ONE focused TECHNICAL question.
   - Keep it SHORT (1-2 sentences max).
   - Pick ONE specific topic from their resume.
   - Ask "How does X work?", "Explain Y", or "What is Z?".
   - Do NOT ask multi-part questions.
   - CRITICAL: Do NOT repeat previous topics.`;
                example = `"Can you explain how garbage collection works in Java?"`;
            } else {
                instructions = `3. Ask ONE focused BEHAVIORAL question.
   - Keep it SHORT (1-2 sentences max).
   - Ask about a specific situation or skill.
   - Do NOT ask multi-part questions.
   - CRITICAL: Do NOT repeat previous topics.`;
                example = `"Tell me about a time when you had to resolve a conflict within your team."`;
            }

            if (isEnd) {
                prompt = `You are OCTA8, an expert Interviewer. The interview is complete.
CONTEXT:
Phase: Evaluation
Interview History:
${fullConversation}
Last User Answer: ${message}

TASK:
1. Evaluate the candidate strictly on their answers, tone, vocabulary, fluency, and communication clarity shown in the history above.
2. Do NOT use information from the resume that wasn't confirmed during the chat.
3. You MUST provide a numeric score (0-10) for BOTH categories. Use your best judgment based on the available history.
4. Output a plain text Scorecard using the EXACT format below.

REQUIRED OUTPUT FORMAT (You MUST start with [SCORECARD]):
[SCORECARD]
Technical Score: [number]/10
Communication Score: [number]/10
Strengths:
- [Point]
Areas for Improvement:
- [Point]
Summary:
[Brief summary]`;
            } else {
                prompt = `You are OCTA8, an expert Technical Interviewer.

INSTRUCTIONS:
1. Read the Context below.
2. Generate exactly ONE follow-up question based on the Candidate's Last Answer and Resume.
${instructions}
4. OUTPUT ONLY THE QUESTION. Do not include "Interviewer:", headers, or explanations.
5. CRITICAL: Keep the question SHORT - maximum 1-2 sentences.

CONTEXT:
Phase: ${newStage}
Resume Snippet: ${session.resume_text.substring(0, 1500)}
last_answer: "${message}"

EXAMPLE OUTPUT:
${example}

YOUR QUESTION (1-2 sentences max):`;
            }
        }

        const ollamaResponse = await axios.post(ollamaUrl, {
            model: 'phi3:mini',
            prompt: prompt,
            stream: false,
            options: {
                stop: ["Candidate:", "User:", "Answer:", "Now, please answer", "Observation:", "Interviewer:"]
            }
        }, { timeout: 120000 });

        const rawResponse = ollamaResponse.data.response;
        console.log(`🤖 Raw AI Response: ${JSON.stringify(rawResponse)} `);

        let aiReply = cleanAiResponse(rawResponse);
        console.log(`✨ Cleaned AI Response: ${JSON.stringify(aiReply)} `);

        if (!aiReply) {
            console.warn("⚠️ Cleaned response is empty! Falling back to raw or default.");
            aiReply = rawResponse || "I'm processing that, could you rephrase?";
        }

        // Save AI Response
        await pool.execute('INSERT INTO messages (session_id, sender, message_text) VALUES (?, ?, ?)', [sessionId, 'ai', aiReply]);

        res.json({ reply: aiReply });

    } catch (error) {
        console.error('Error in /api/chat:', error);
        res.status(500).json({ error: 'Failed to process chat', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
