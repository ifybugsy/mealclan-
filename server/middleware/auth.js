import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function generateToken(userId, email) {
  return jwt.sign(
    { userId, email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function authenticate(req, res, next) {
  try {
    const token = req.cookies.adminToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

export function handleError(error, req, res) {
  console.error('[v0] Error:', error.message);
  
  if (error.message.includes('duplicate')) {
    return res.status(409).json({ error: 'Duplicate entry' });
  }
  
  if (error.message.includes('not found')) {
    return res.status(404).json({ error: error.message });
  }
  
  res.status(500).json({ error: error.message || 'Internal server error' });
}
