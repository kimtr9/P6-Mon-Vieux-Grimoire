const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    try {
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        req.auth = {userId: decodedToken.userId};
        next();
    } catch(error) {
        console.error('Erreur d\'authentification', error)
        res.status(401).json({error: 'Requête non identifiée'})
    }
};