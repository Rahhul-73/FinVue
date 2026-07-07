const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  // Retrieve token from HTTP-only cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_for_finance_tracker_123_development_mode');
    
    // Attach user payload (id, email) to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    
    next();
  } catch (error) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid token. Please log in again.',
    });
  }
};

module.exports = { protect };
