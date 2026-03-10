const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticate = async (req, res, next) => {
    try {
        const header = req.headers.authorization;

        //Authorization: Bearer <token>
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ error:'Access denied. No token provided.'});
        }

        const token = header.split(' ')[1];
        
        //verify the token 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userResult = await query(
            `SELECT u.user_id, u.email, u.full_name, u.is_active,
            ARRAY_AGG(r.role_name) AS roles
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            WHERE u.user_id = $1
            GROUP BY u.user_id`,
            [decoded.userId]
        );

        //example response for above query
        // userResult.rows[0] = {
        // user_id: 5,
        // email: 'user@test.com',
        // full_name: 'Anas',
        // is_active: true,
        // roles: ['customer', 'driver']
        //}

        if (userResult.rows.length === 0) {
            return res.status(401).json({error: 'User not found.'});
        }

        const user = userResult.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ error:'Account is not active.'});
        }

        
        req.user = {
            userId: user.user_id,
            email: user.email,
            fullName: user.full_name,
            roles: user.roles,
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        //pass to global error handler in pp.js bcz ye koi bara error agaya ;(
        next(err);
    }
};

module.exports = { authenticate };
