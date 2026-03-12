const { query } = require('../config/database');

// GET /api/v1/payments/rentals

const getRentalPayments = async (req, res, next) => {
    try {
        const isAdmin = req.user.roles.includes('admin');
        let sql = `SELECT rp.*, u.full_name, rb.start_date, rb.end_date, v.model AS vehicle_model
            FROM rental_payments rp
            JOIN users u ON rp.user_id = u.user_id
            JOIN rental_bookings rb ON rp.rental_id = rb.rental_id
            JOIN vehicles v ON rb.vehicle_id = v.vehicle_id`;
        
            const params = [];
        if (!isAdmin) {
            params.push(req.user.userId); 
            sql += ` WHERE rp.user_id = $1`; 
        }
        sql += ' ORDER BY rp.payment_time DESC';
        const result = await query(sql, params);
        res.json({ payments: result.rows });
    } catch (err) { next(err); }
};

// GET /api/v1/payments/rides
const getRidePayments = async (req, res, next) => {
    try {
        const isAdmin = req.user.roles.includes('admin');
        let sql = `SELECT rp.*, u.full_name, rb.pickup_location, rb.dropoff_location
            FROM ride_payments rp
            JOIN users u ON rp.user_id = u.user_id
            JOIN ride_bookings rb ON rp.ride_id = rb.ride_id`;
        const params = [];
        if (!isAdmin) { params.push(req.user.userId); sql += ` WHERE rp.user_id = $1`; }
        sql += ' ORDER BY rp.payment_time DESC';
        const result = await query(sql, params);
        res.json({ payments: result.rows });
    } catch (err) { next(err); }
};

// GET /api/v1/payments/carpools
const getCarpoolPayments = async (req, res, next) => {
    try {
        const isAdmin = req.user.roles.includes('admin');
        let sql = `SELECT cp.*, u.full_name, co.origin, co.destination
            FROM carpool_payments cp
            JOIN users u ON cp.user_id = u.user_id
            JOIN carpool_bookings cb ON cp.carpool_booking_id = cb.booking_id
            JOIN carpool_offers co ON cb.carpool_id = co.carpool_id`;
        const params = [];
        if (!isAdmin) { params.push(req.user.userId); sql += ` WHERE cp.user_id = $1`; }
        sql += ' ORDER BY cp.payment_time DESC';
        const result = await query(sql, params);
        res.json({ payments: result.rows });
    } catch (err) { next(err); }
};

// PUT /api/v1/payments/rentals/:id/status   (admin)
const updateRentalPaymentStatus = async (req, res, next) => {
    try {
        const { payment_status } = req.body;
        const valid = ['pending', 'completed', 'failed', 'refunded'];
        if (!valid.includes(payment_status)) return res.status(400).json({ error: `Must be: ${valid.join(', ')}` });
        const result = await query('UPDATE rental_payments SET payment_status = $1 WHERE payment_id = $2 RETURNING *', [payment_status, req.params.id]);
        if (!result.rows.length) 
            return res.status(404).json({ error: 'Not found.' });
        res.json({ message: 'Updated', payment: result.rows[0] });
    } catch (err) { next(err); }
};

// PUT /api/v1/payments/rides/:id/status (admin)
const updateRidePaymentStatus = async (req, res, next) => {
    try {
        const { payment_status } = req.body;
        const valid = ['pending', 'completed', 'failed', 'refunded'];
        if (!valid.includes(payment_status)) return res.status(400).json({ error: `Must be: ${valid.join(', ')}` });
        const result = await query('UPDATE ride_payments SET payment_status = $1 WHERE payment_id = $2 RETURNING *', [payment_status, req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Not found.' });
        res.json({ message: 'Updated', payment: result.rows[0] });
    } catch (err) { next(err); }
};

// PUT /api/v1/payments/carpools/:id/status (admin)
const updateCarpoolPaymentStatus = async (req, res, next) => {
    try {
        const { payment_status } = req.body;
        const valid = ['pending', 'completed', 'failed', 'refunded'];
        if (!valid.includes(payment_status)) return res.status(400).json({ error: `Must be: ${valid.join(', ')}` });
        const result = await query('UPDATE carpool_payments SET payment_status = $1 WHERE payment_id = $2 RETURNING *', [payment_status, req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Not found.' });
        res.json({ message: 'Updated', payment: result.rows[0] });
    } catch (err) { next(err); }
};

// GET /api/v1/payments/summary (admin)
const getPaymentSummary = async (_req, res, next) => {
    try {
        const r = await query('SELECT payment_status, COUNT(*) cnt, COALESCE(SUM(amount),0) total FROM rental_payments GROUP BY payment_status');
        const d = await query('SELECT payment_status, COUNT(*) cnt, COALESCE(SUM(amount),0) total FROM ride_payments GROUP BY payment_status');
        const c = await query('SELECT payment_status, COUNT(*) cnt, COALESCE(SUM(amount),0) total FROM carpool_payments GROUP BY payment_status');
        res.json({ rental: r.rows, ride: d.rows, carpool: c.rows });
    } catch (err) { next(err); }
};

module.exports = {
    getRentalPayments,
    getRidePayments,
    getCarpoolPayments,
    updateRentalPaymentStatus,
    updateRidePaymentStatus,
    updateCarpoolPaymentStatus,
    getPaymentSummary,
};
