
//after autherntiaction, check wether you are allowed to do etc...

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({
                error: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
            });
        }

        next();
    };
};

module.exports = { authorize };
