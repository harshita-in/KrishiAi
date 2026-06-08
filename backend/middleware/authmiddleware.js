const jwt = require('jsonwebtoken');

const protect = (requiredRole) => {
  return (req, res, next) => {
    let token;

    // Check for token in the Authorization Header (e.g., Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];

        // Decode and verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Crucial for 2-portal system: Verify if the user's role matches the required portal access
        if (requiredRole && decoded.role !== requiredRole) {
          return res.status(403).json({ error: `Access denied. Requires ${requiredRole} portal authorization.` });
        }

        // Attach user info to the request object
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