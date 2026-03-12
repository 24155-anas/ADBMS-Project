const { query } = require('../config/database');

// GET /api/v1/users  (admin only)
const listUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, is_active } = req.query;
        const offset = (page - 1) * limit;

        let sql = `
            SELECT u.user_id, u.email, u.phone, u.full_name, u.profile_pic,
            u.created_at, u.is_active,
            ARRAY_AGG(r.role_name) AS roles
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id`;
        const conditions = [];
        const params = [];

        if (role) {
            params.push(role);
            conditions.push(`r.role_name = $${params.length}`);
        }
        if (is_active !== undefined) {
            params.push(is_active === 'true');
            conditions.push(`u.is_active = $${params.length}`);
        }

        if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' GROUP BY u.user_id ORDER BY u.user_id';
        params.push(parseInt(limit, 10));
        sql += ` LIMIT $${params.length}`;
        params.push(parseInt(offset, 10));
        sql += ` OFFSET $${params.length}`;

        const result = await query(sql, params);

        let countSql = `
          SELECT COUNT(DISTINCT u.user_id)
          FROM users u
          JOIN user_roles ur ON u.user_id = ur.user_id
          JOIN roles r ON ur.role_id = r.role_id
        `;
        const countConditions = [];
        const countParams = [];
        if (role) {
            countParams.push(role);
            countConditions.push(`r.role_name = $${countParams.length}`);
        }
        if (is_active !== undefined) {
            countParams.push(is_active === 'true');
            countConditions.push(`u.is_active = $${countParams.length}`);
        }
        if (countConditions.length) countSql += ' WHERE ' + countConditions.join(' AND ');
        const countResult = await query(countSql, countParams);

        res.json({
            users: result.rows,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total: parseInt(countResult.rows[0].count, 10),
            },
        });
    } catch (err) {
        next(err);
    }
};




// GET /api/v1/users/:id (admin only)
const getUser = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT u.user_id, u.email, u.phone, u.full_name, u.profile_pic,
            u.created_at, u.is_active,
            ARRAY_AGG(r.role_name) AS roles
            FROM users u
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r       ON ur.role_id = r.role_id
            WHERE u.user_id = $1
            GROUP BY u.user_id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// PUT /api/v1/users/:id (admin only)
const updateUser = async (req, res, next) => {
    try {
        const { full_name, phone, is_active } = req.body;

        const result = await query(
            `UPDATE users
            SET full_name = COALESCE($1, full_name),
            phone = COALESCE($2, phone),
            is_active = COALESCE($3, is_active)
            WHERE user_id = $4
            RETURNING user_id, email, phone, full_name, is_active`,
            [full_name, phone, is_active, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'User updated', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Phone number already in use.' });
        }
        next(err);
    }
};

// PUT /api/v1/users/:id/role (admin only)
const assignRole = async (req, res, next) => {
    try {
        const { role_name } = req.body;
        if (!['customer', 'driver', 'admin'].includes(role_name)) {
            return res.status(400).json({ error: 'Invalid role. Must be customer, driver, or admin.' });
        }

        await query(
            `INSERT INTO user_roles (user_id, role_id)
            VALUES ($1, (SELECT role_id FROM roles WHERE role_name = $2))
            ON CONFLICT (user_id, role_id) DO NOTHING`,
            [req.params.id, role_name]
        );

        res.json({ message: `Role '${role_name}' assigned to user ${req.params.id}` });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/v1/users/:id/role (admin only)
const removeRole = async (req, res, next) => {
    try {
        const { role_name } = req.body;

        const result = await query(
            `DELETE FROM user_roles
            WHERE user_id = $1
            AND role_id = (SELECT role_id FROM roles WHERE role_name = $2)`,
            [req.params.id, role_name]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Role assignment not found.' });
        }

        res.json({ message: `Role '${role_name}' removed from user ${req.params.id}` });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/v1/users/:id (admin only : soft delete)
const deactivateUser = async (req, res, next) => {
    try {
        const result = await query(
            `UPDATE users SET is_active = FALSE WHERE user_id = $1 RETURNING user_id, email`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'User deactivated', user: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

module.exports = { listUsers, getUser, updateUser, assignRole, removeRole, deactivateUser };
