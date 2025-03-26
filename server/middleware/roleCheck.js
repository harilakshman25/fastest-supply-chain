module.exports = (roles) => (req, res, next) => {
  // Check if user exists in request
  if (!req.user) {
    console.log('RoleCheck middleware: No user in request');
    return res.status(401).json({ msg: 'User not authenticated' });
  }

  console.log(`RoleCheck middleware: Checking if user role '${req.user.role}' is in allowed roles:`, roles);
  
  // Check if user's role is in the allowed roles
  if (!roles.includes(req.user.role)) {
    console.log(`RoleCheck middleware: Access denied for user with role '${req.user.role}'`);
    return res.status(403).json({ msg: 'Access denied: Insufficient permissions' });
  } else {
    console.log(`RoleCheck middleware: Access granted for user with role '${req.user.role}'`);
    next();
  }
};
