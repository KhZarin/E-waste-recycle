const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Login kora user ke chara kono route e dhukte debe na
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role check: authorize('admin'), authorize('partner', 'admin') ityadi
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Logged in user role:", req.user.role);
console.log("Allowed roles:", roles);
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'You do not have permission for this action' });
    }
    next();
  };
};

module.exports = { protect, authorize };