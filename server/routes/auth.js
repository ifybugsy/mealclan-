import express from 'express';
import bcryptjs from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/database.js';
import { generateToken, verifyToken, authenticate, handleError } from '../middleware/auth.js';

const router = express.Router();

// Initialize admin user on first run
async function ensureAdminExists() {
  const db = await getDatabase();
  const users = db.collection('users');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mealclan.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';

  const existingAdmin = await users.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);
    await users.insertOne({
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
    });
    console.log('[v0] Admin user created with email:', adminEmail);
  }
}

// Initialize admin on module load
ensureAdminExists().catch(err => console.error('[v0] Error ensuring admin exists:', err.message));

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id.toString(), user.email);

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true });
});

// Verify token endpoint
router.get('/verify', authenticate, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(req.admin.userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    handleError(error, req, res);
  }
});

// Change password endpoint
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    const db = await getDatabase();
    const users = db.collection('users');

    const user = await users.findOne({ _id: new ObjectId(req.admin.userId) });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcryptjs.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await users.updateOne(
      { _id: new ObjectId(req.admin.userId) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    handleError(error, req, res);
  }
});

export default router;
