import jwt from 'jsonwebtoken';

export const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ message: 'Unauthorized, JWT token is required' });
  }

  try {
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    req.user = decoded; // { _id, email, name, etc. }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized, JWT token wrong or expired' });
  }
};
