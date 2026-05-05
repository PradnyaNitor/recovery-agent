import express from 'express';
import { z } from 'zod';
import { AuthService } from '../services/authService.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const user = await AuthService.createUser({ email, password, name });
    const token = AuthService.generateToken(user);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    });
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const { user, token } = await AuthService.authenticateUser({ email, password });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get current user profile
router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await AuthService.getUserById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      created_at: user.created_at
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

export default router;