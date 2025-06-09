import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
let sessions = [];
let messages = {};

// GET sessions
app.get('/api/chat/sessions', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }
  
  const userSessions = sessions.filter(s => s.userId === userId);
  res.json(userSessions);
});

// POST session
app.post('/api/chat/sessions', (req, res) => {
  const session = {
    id: Math.random().toString(36).substring(2, 11),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true
  };
  
  sessions.push(session);
  messages[session.id] = [];
  
  res.json(session);
});

// DELETE session
app.delete('/api/chat/sessions/:id', (req, res) => {
  const { id } = req.params;
  sessions = sessions.filter(s => s.id !== id);
  delete messages[id];
  res.json({ success: true });
});

// GET messages
app.get('/api/chat/messages', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID required' });
  }
  
  res.json(messages[sessionId] || []);
});

// POST message
app.post('/api/chat/messages', (req, res) => {
  const message = {
    id: Math.random().toString(36).substring(2, 11),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  const { sessionId } = req.body;
  if (!messages[sessionId]) {
    messages[sessionId] = [];
  }
  
  messages[sessionId].push(message);
  res.json(message);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});