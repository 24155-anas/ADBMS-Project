const { query } = require('../config/database');

// GET /api/v1/vehicles (public)
const listVehicles = async (req, res, next) => {
    try {
        const { vehicle_type, is_available, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        let sql = 'SELECT * FROM vehicles';
        const conditions = [];
        const params = [];

        if (vehicle_type) {
            params.push(vehicle_type);
            conditions.push(`vehicle_type = $${params.length}`);
        }
        if (is_available !== undefined) {
            params.push(is_available === 'true');
            conditions.push(`is_available = $${params.length}`);
        }

        if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY vehicle_id';
        params.push(parseInt(limit, 10));
        sql += ` LIMIT $${params.length}`;
        params.push(parseInt(offset, 10));
        sql += ` OFFSET $${params.length}`;

        const result = await query(sql, params);
        res.json({ vehicles: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/vehicles/:id   (public)
const getVehicle = async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM vehicles WHERE vehicle_id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found.' });
        }
        res.json({ vehicle: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/vehicles/:id/reviews   (public)
const getVehicleReviews = async (req, res, next) => {
    try {
        const stats = await query(
            'SELECT * FROM vw_vehicle_review_stats WHERE vehicle_id = $1',
            [req.params.id]
        );
        const reviews = await query(
            `SELECT r.review_id, r.rating, r.comment, r.booking_type, r.created_at,
            u.full_name AS reviewer_name
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.user_id
            WHERE r.vehicle_id = $1
            ORDER BY r.created_at DESC`,
            [req.params.id]
        );

        res.json({
            stats: stats.rows[0] || null,
            reviews: reviews.rows,
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/v1/vehicles (admin only)
const createVehicle = async (req, res, next) => {
    try {
        const { licence_plate, model, seats, hourly_rate, vehicle_type } = req.body;

        if (!licence_plate || !model || !seats || !hourly_rate || !vehicle_type) {
            return res.status(400).json({ error: 'licence_plate, model, seats, hourly_rate, and vehicle_type are required.' });
        }

        const result = await query(
            `INSERT INTO vehicles (licence_plate, model, seats, hourly_rate, vehicle_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [licence_plate, model, seats, hourly_rate, vehicle_type]
        );

        res.status(201).json({ message: 'Vehicle created', vehicle: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Licence plate already registered.' });
        }
        if (err.code === '23514') {
            return res.status(400).json({ error: 'Check constraint failed. Verify seats > 0, hourly_rate >= 0, valid vehicle_type.' });
        }
        next(err);
    }
};

// PUT /api/v1/vehicles/:id (admin only)
const updateVehicle = async (req, res, next) => {
    try {
        const { model, seats, hourly_rate, is_available, vehicle_type } = req.body;

        const result = await query(
            `UPDATE vehicles
            SET model = COALESCE($1, model),
            seats = COALESCE($2, seats),
            hourly_rate = COALESCE($3, hourly_rate),
            is_available = COALESCE($4, is_available),
            vehicle_type = COALESCE($5, vehicle_type)
            WHERE vehicle_id = $6
            RETURNING *`,
            [model, seats, hourly_rate, is_available, vehicle_type, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found.' });
        }

        res.json({ message: 'Vehicle updated', vehicle: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/v1/vehicles/:id (admin only)
const deleteVehicle = async (req, res, next) => {
    try {
        const result = await query(
            'DELETE FROM vehicles WHERE vehicle_id = $1 RETURNING vehicle_id, model',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found.' });
        }

        res.json({ message: 'Vehicle deleted', vehicle: result.rows[0] });
    } catch (err) {
        //db ka trigger
        //trg_check_vehicle_before_delete raises an exception
        if (err.message && err.message.includes('Cannot delete vehicle')) {
            return res.status(409).json({ error: err.message });
        }
        next(err);
    }
};

module.exports = { listVehicles, getVehicle, getVehicleReviews, createVehicle, updateVehicle, deleteVehicle };
