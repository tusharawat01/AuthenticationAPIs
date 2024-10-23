const jwt = require('jsonwebtoken');

// Middleware to check if the user has the required role
exports.verifyRole = (requiredRole) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) return res.status(403).json({ message: 'No token provided' });

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(401).json({ message: 'Invalid token' });

            // Check if the user's role matches the required role
            if (decoded.role !== requiredRole) {
                return res.status(403).json({ message: 'Access denied' });
            }

            req.user = decoded;  // Attach user info to request
            next();
        });
    };
};
