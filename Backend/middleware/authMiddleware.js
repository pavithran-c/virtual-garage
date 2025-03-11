const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Log headers and cookies for debugging
  console.log('Request headers:', req.headers);
  console.log('Request cookies:', req.cookies);
  
  // Check for token in cookies or Authorization header
  const cookieToken = req.cookies?.token;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  const token = cookieToken || headerToken;
  
  console.log('Cookie token:', cookieToken ? 'Present' : 'Not present');
  console.log('Header token:', headerToken ? 'Present' : 'Not present');
  
  if (!token) {
    console.log('No token found in cookies or headers');
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    if (!decoded.id) {
      console.log('Token missing id field:', decoded);
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    req.user = { id: decoded.id };
    console.log('User set in request:', req.user);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message, error.stack);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;