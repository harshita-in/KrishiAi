const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

const protect = (requiredRole) => {
  return (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        if (requiredRole && decoded.role !== requiredRole) {
          return res.status(403).json({ error: `Access denied. Requires ${requiredRole} portal authorization.` });
        }

        req.user = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Not authorized, token invalid or expired' });
      }
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token provided' });
    }
  };
};

module.exports = { protect };
