const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/database');


// POST /api/v1/auth/register
// creating a new account


const register = async (req, res, next) => {
    const client = await getClient();
    try {
        const { email, password, phone, full_name, role } = req.body;

        if (!email || !password || !phone || !full_name) {
            return res.status(400).json({ error: 'email, password, phone, and full_name are required.' });
        }

        const validRoles = ['customer', 'driver'];
        const selectedRole = validRoles.includes(role) ? role : 'customer';

        const passwordHash = await bcrypt.hash(password, 12);

        await client.query('BEGIN');

        const userResult = await client.query(
            `INSERT INTO users (email, password_hash, phone, full_name)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, email, full_name, created_at`,
            [email, passwordHash, phone, full_name]
        );
        const newUser = userResult.rows[0];

        await client.query(
            `INSERT INTO user_roles (user_id, role_id)
            VALUES ($1, (SELECT role_id FROM roles WHERE role_name = $2))`,
            [newUser.user_id, selectedRole]
        );

        await client.query('COMMIT');

        //creating jwt token
        const token = jwt.sign(
            { userId: newUser.user_id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                user_id: newUser.user_id,
                email: newUser.email,
                full_name: newUser.full_name,
                role: selectedRole,
                created_at: newUser.created_at,
            },
        });
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Email or phone already registered.' });
        }
        next(err);
    } finally {
        client.release();
    }
};


// POST /api/v1/auth/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const result = await query(
            `SELECT u.user_id, u.email, u.password_hash, u.full_name, u.is_active,
            ARRAY_AGG(r.role_name) AS roles
            FROM users u
            
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            WHERE u.email = $1
            GROUP BY u.user_id`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = result.rows[0];
        if (!user.is_active) {
            return res.status(403).json({ error: 'Account is deactivated. Contact admin.' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            //same secret when checked in middlewere/auth.js
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                full_name: user.full_name,
                roles: user.roles,
            },
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/auth/profile (protected, first its authenticated)

const getProfile = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT u.user_id, u.email, u.phone, u.full_name, u.profile_pic,
            u.created_at, u.is_active,
            ARRAY_AGG(r.role_name) AS roles
            FROM users u
            
            JOIN user_roles ur ON u.user_id = ur.user_id
            JOIN roles r ON ur.role_id = r.role_id
            WHERE u.user_id = $1
            GROUP BY u.user_id`,
            [req.user.userId]
        );

        res.json({ user: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// PUT /api/v1/auth/profile   (protected)
const updateProfile = async (req, res, next) => {
    try {
        const { full_name, phone, profile_pic } = req.body;

        const result = await query(
            `UPDATE users
            SET full_name   = COALESCE($1, full_name),
            phone = COALESCE($2, phone),
            profile_pic = COALESCE($3, profile_pic)
            
            WHERE user_id = $4
            RETURNING user_id, email, phone, full_name, profile_pic`,
            [full_name, phone, profile_pic, req.user.userId]
        );

        res.json({ message: 'Profile updated', user: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Phone number already in use.' });
        }
        next(err);
    }
};

// PUT /api/v1/auth/change-password   (protected)

const changePassword = async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({ error: 'current_password and new_password are required.' });
        }

        if (new_password.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters.' });
        }

        const userResult = await query(
            'SELECT password_hash FROM users WHERE user_id = $1',
            [req.user.userId]
        );

        const match = await bcrypt.compare(current_password, userResult.rows[0].password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        const newHash = await bcrypt.hash(new_password, 12);
        await query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [newHash, req.user.userId]);

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
