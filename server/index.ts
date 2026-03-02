import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-intermax-2025';

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  app.use(cors());
  app.use(express.json());

  // Setup uploads directory
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  app.use('/uploads', express.static(uploadsDir));

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
  const upload = multer({ storage });

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
      const user = { id: result.lastInsertRowid, name, email, role: 'user' };
      const token = jwt.sign({ id: user.id, email, role: 'user' }, JWT_SECRET);
      
      io.to('admin').emit('newUser', user);
      
      res.json({ token, user });
    } catch (error) {
      res.status(400).json({ error: 'Email already exists' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(req.user.id);
    if (user) {
      res.json({ user });
    } else {
      res.sendStatus(404);
    }
  });

  // Profile Update
  app.put('/api/profile', authenticateToken, upload.single('avatar'), (req: any, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.id;
    let avatarPath = req.file ? `/uploads/${req.file.filename}` : undefined;

    let updateQuery = 'UPDATE users SET name = ?, email = ?';
    let params: any[] = [name, email];

    if (password) {
      updateQuery += ', password = ?';
      params.push(bcrypt.hashSync(password, 10));
    }
    if (avatarPath) {
      updateQuery += ', avatar = ?';
      params.push(avatarPath);
    }

    updateQuery += ' WHERE id = ?';
    params.push(userId);

    try {
      db.prepare(updateQuery).run(...params);
      const updatedUser = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(userId);
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(400).json({ error: 'Update failed' });
    }
  });

  // Settings API
  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all() as {key: string, value: string}[];
    const settingsObj = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
    res.json(settingsObj);
  });

  app.put('/api/settings', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const settings = req.body;
    const updateSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        updateSetting.run(key, value);
      }
    })();
    
    res.json({ success: true });
  });

  // Sections API
  app.get('/api/sections', (req, res) => {
    const sections = db.prepare('SELECT * FROM sections').all();
    res.json(sections);
  });

  app.post('/api/sections', authenticateToken, upload.single('image'), (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { title, description } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const result = db.prepare('INSERT INTO sections (title, description, image) VALUES (?, ?, ?)').run(title, description, imagePath);
    res.json({ id: result.lastInsertRowid, title, description, image: imagePath });
  });

  app.put('/api/sections/:id', authenticateToken, upload.single('image'), (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { title, description } = req.body;
    const sectionId = req.params.id;
    
    let updateQuery = 'UPDATE sections SET title = ?, description = ?';
    let params: any[] = [title, description];

    if (req.file) {
      updateQuery += ', image = ?';
      params.push(`/uploads/${req.file.filename}`);
    }
    updateQuery += ' WHERE id = ?';
    params.push(sectionId);

    db.prepare(updateQuery).run(...params);
    res.json({ success: true });
  });

  app.delete('/api/sections/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    db.prepare('DELETE FROM sections WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Visits API
  app.post('/api/visits', (req, res) => {
    const { page } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    try {
      db.prepare('INSERT INTO visits (ip, user_agent, page) VALUES (?, ?, ?)').run(ip ? String(ip) : 'unknown', userAgent, page);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to log visit' });
    }
  });

  app.get('/api/visits', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const visits = db.prepare('SELECT * FROM visits ORDER BY timestamp DESC LIMIT 100').all();
    const totalVisits = db.prepare('SELECT COUNT(*) as count FROM visits').get() as { count: number };
    res.json({ visits, total: totalVisits.count });
  });

  // Contact Messages API
  app.post('/api/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    try {
      const result = db.prepare('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)').run(
        name, email, phone || null, subject || null, message
      );
      
      // Notify admin about new contact message
      io.to('admin').emit('newContactMessage', {
        id: result.lastInsertRowid,
        name,
        email,
        phone,
        subject,
        message,
        status: 'new',
        timestamp: new Date().toISOString()
      });
      
      res.json({ success: true, id: result.lastInsertRowid });
    } catch (error) {
      console.error('Error saving contact message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  });

  app.get('/api/contact', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      const messages = db.prepare('SELECT * FROM contact_messages ORDER BY timestamp DESC').all();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.put('/api/contact/:id/status', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const { status } = req.body;
    try {
      db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  });

  app.delete('/api/contact/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    try {
      db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete message' });
    }
  });

  // Chat API
  app.get('/api/chat/messages', authenticateToken, (req: any, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    let messages;
    if (role === 'admin') {
      const { userId: chatUserId } = req.query;
      if (chatUserId) {
        messages = db.prepare('SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY timestamp ASC').all(chatUserId, chatUserId);
      } else {
        messages = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC').all();
      }
    } else {
      messages = db.prepare('SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY timestamp ASC').all(userId, userId);
    }
    res.json(messages);
  });

  app.get('/api/chat/users', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.sendStatus(403);
    const users = db.prepare("SELECT id, name, email, avatar FROM users WHERE role != 'admin' ORDER BY id DESC").all();
    res.json(users);
  });

  // Socket.io for Chat
  io.on('connection', (socket) => {
    socket.on('join', (data) => {
      const userId = typeof data === 'object' ? data.userId : data;
      const role = typeof data === 'object' ? data.role : 'user';
      
      socket.join(userId.toString());
      if (role === 'admin') {
        socket.join('admin');
      }
    });

    socket.on('sendMessage', (data) => {
      const { senderId, receiverId, content, role } = data;
      
      let actualReceiverId = receiverId;
      if (role === 'user') {
        const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get() as { id: number };
        if (admin) {
          actualReceiverId = admin.id;
        }
      }

      const result = db.prepare('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)').run(senderId, actualReceiverId, content);
      const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
      
      if (role === 'admin') {
        io.to(actualReceiverId.toString()).emit('newMessage', message);
      } else {
        io.to('admin').emit('newMessage', message);
      }
      
      // Send back to sender so they see their own message
      socket.emit('newMessage', message);
    });
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
