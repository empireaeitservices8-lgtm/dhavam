const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const jwtMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is missing.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token only contains email and role, so look up the numeric user ID
    const user = await userService.getProfile(decoded.email);

    req.payload = user.id;   // numeric user ID, used by cart/order controllers
    req.email = decoded.email;
    req.role = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

module.exports = jwtMiddleware;