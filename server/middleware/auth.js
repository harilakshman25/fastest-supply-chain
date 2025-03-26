const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  
  try {
    console.log('Auth middleware: Verifying token');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    console.log('Auth middleware: Token verified successfully for user:', req.user);
    
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed', err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};