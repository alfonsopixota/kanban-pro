const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'No hay token, acceso denegado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'CLAVE_POR_DEFECTO');
        req.userId = decoded.id;
        next();
    } catch (e) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = auth;
