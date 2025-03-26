module.exports = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    console.log("Role check")
    return res.status(403).json({ msg: 'Access denied: Insufficient permissions' });
  } else {
    next();
  }
};
