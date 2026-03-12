const { query } = require('../config/database');

// GET /api/v1/reviews
const listReviews = async (req, res, next) => {
    try {
        const { booking_type, vehicle_id, reviewee_id, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        let sql = `SELECT r.*, u.full_name AS reviewer_name,
            ru.full_name AS reviewee_name, v.model AS vehicle_model
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.user_id
            LEFT JOIN users ru ON r.reviewee_id = ru.user_id
            LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id`;
        
        const conds = [];
        const params = [];
        if (booking_type) {
            params.push(booking_type);
            conds.push(`r.booking_type = $${params.length}`);
        }
        if (vehicle_id) {
            params.push(vehicle_id);
            conds.push(`r.vehicle_id = $${params.length}`); 
        }
        if (reviewee_id) {
            params.push(reviewee_id); 
            conds.push(`r.reviewee_id = $${params.length}`); 
        }
        if (conds.length) 
            sql += ' WHERE ' + conds.join(' AND ');
        
        sql += ' ORDER BY r.created_at DESC';
        params.push(parseInt(limit, 10)); sql += ` LIMIT $${params.length}`;
        params.push(parseInt(offset, 10)); sql += ` OFFSET $${params.length}`;
        const result = await query(sql, params);
        res.json({ reviews: result.rows });
    } catch (err) { next(err); }
};



// GET /api/v1/reviews/vehicle-stats (all/public)
const getVehicleStats = async (_req, res, next) => {
    try {
        const result = await query('SELECT * FROM vw_vehicle_review_stats ORDER BY avg_rating DESC');
        res.json({ stats: result.rows });
    } catch (err) { next(err); }
};

// GET /api/v1/reviews/driver-earnings (admin)
const getDriverEarnings = async (_req, res, next) => {
    try {
        const result = await query('SELECT * FROM vw_driver_earnings ORDER BY total_earnings DESC');
        res.json({ earnings: result.rows });
    } catch (err) { next(err); }
};

// GET /api/v1/reviews/:id (public)
const getReview = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT r.*, u.full_name AS reviewer_name
            FROM reviews r JOIN users u ON r.reviewer_id = u.user_id
            WHERE r.review_id = $1`,
            [req.params.id]
        );
        if (!result.rows.length) 
            return res.status(404).json({ error: 'Review not found.' });
        
        res.json({ review: result.rows[0] });
    } catch (err) { next(err); }
};

// POST /api/v1/reviews   (customer — authenticated)
const createReview = async (req, res, next) => {
    try {
        const { reviewee_id, vehicle_id, booking_type, rating, comment } = req.body;
        if (!booking_type || !rating) return res.status(400).json({ error: 'booking_type and rating are required.' });
        const result = await query(
            `INSERT INTO reviews (reviewer_id, reviewee_id, vehicle_id, booking_type, rating, comment)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.userId, reviewee_id || null, vehicle_id || null, booking_type, rating, comment || null]
        );
        res.status(201).json({ message: 'Review created', review: result.rows[0] });
    } catch (err) {
        if (err.code === '23514') return res.status(400).json({ error: 'Rating must be 1-5, booking_type must be rental/ride/carpool.' });
        next(err);
    }
};

// DELETE /api/v1/reviews/:id   (admin or review owner)
const deleteReview = async (req, res, next) => {
    try {
        const review = await query('SELECT * FROM reviews WHERE review_id = $1', [req.params.id]);
        if (!review.rows.length) return res.status(404).json({ error: 'Review not found.' });
        const isOwner = review.rows[0].reviewer_id === req.user.userId;
        const isAdmin = req.user.roles.includes('admin');
        if (!isOwner && !isAdmin) 
            return res.status(403).json({ error: 'Access denied.' });
        await query('DELETE FROM reviews WHERE review_id = $1', [req.params.id]);
        res.json({ message: 'Review deleted' });
    } catch (err) { next(err); }
};

module.exports = { listReviews, getVehicleStats, getDriverEarnings, getReview, createReview, deleteReview };
