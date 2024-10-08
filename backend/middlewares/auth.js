
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ message: 'Authorization header manquant' });
        }

        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        req.auth = { userId: decodedToken.userId };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid request!' });
    }
};
