const { query, getClient } = require('../config/database');

// GET /api/v1/rentals/active (admin DB view)
const getActiveRentals = async (_req, res, next) => {
    try {
        const result = await query('SELECT * FROM vw_active_rentals');
        res.json({ active_rentals: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/rentals (customer: own, admin: all)
const listRentals = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const isAdmin = req.user.roles.includes('admin');

        let sql = `SELECT rb.*, u.full_name AS customer_name, v.model AS vehicle_model, v.licence_plate
            FROM rental_bookings rb
            JOIN users u    ON rb.customer_id = u.user_id
            JOIN vehicles v ON rb.vehicle_id  = v.vehicle_id`;
        const conditions = [];
        const params = [];

        if (!isAdmin) {
            params.push(req.user.userId);
            conditions.push(`rb.customer_id = $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`rb.status = $${params.length}`);
        }

        if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY rb.created_at DESC';
        params.push(parseInt(limit, 10));
        sql += ` LIMIT $${params.length}`;
        params.push(parseInt(offset, 10));
        sql += ` OFFSET $${params.length}`;

        const result = await query(sql, params);
        res.json({ rentals: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/rentals/:id
const getRental = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT rb.*, u.full_name AS customer_name, v.model AS vehicle_model
            FROM rental_bookings rb
            JOIN users u    ON rb.customer_id = u.user_id
            JOIN vehicles v ON rb.vehicle_id  = v.vehicle_id
            WHERE rb.rental_id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rental booking not found.' });
        }

        const rental = result.rows[0];
        if (!req.user.roles.includes('admin') && rental.customer_id !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        res.json({ rental });
    } catch (err) {
        next(err);
    }
};



// POST /api/v1/rentals (customer : TRANSACTION)
const createRental = async (req, res, next) => {
    const client = await getClient();
    try {
        const { vehicle_id, start_date, end_date, payment_method } = req.body;

        if (!vehicle_id || !start_date || !end_date) {
            return res.status(400).json({ error: 'vehicle_id, start_date, and end_date are required.' });
        }

        await client.query('BEGIN');

        //locking and checking vehicle availability
        const vehicleResult = await client.query(
            'SELECT * FROM vehicles WHERE vehicle_id = $1 FOR UPDATE',
            [vehicle_id]
        );

        if (vehicleResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Vehicle not found.' });
        }

        const vehicle = vehicleResult.rows[0];
        if (!vehicle.is_available) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Vehicle is not available for rental.' });
        }

        //checking if vehicle is already rented during thw time
        const overlapResult = await client.query(
            `SELECT 1 FROM rental_bookings
            WHERE vehicle_id = $1
            AND status IN ('pending', 'active')
            AND start_date <= $3 AND end_date >= $2`,
            [vehicle_id, start_date, end_date]
        );

        if (overlapResult.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Vehicle is already booked for the selected dates.' });
        }

        //total amount
        const days = Math.max(1, Math.ceil(
            (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)
        ));
        const totalAmount = days * 24 * parseFloat(vehicle.hourly_rate);

        //inserting
        const rentalResult = await client.query(
            `INSERT INTO rental_bookings (customer_id, vehicle_id, start_date, end_date, total_amount, status)
            VALUES ($1, $2, $3, $4, $5, 'pending')
            RETURNING *`,
            [req.user.userId, vehicle_id, start_date, end_date, totalAmount]
        );
        const rental = rentalResult.rows[0];

        //creating record in payment table
        const method = payment_method || 'card';
        const paymentResult = await client.query(
            `INSERT INTO rental_payments (user_id, rental_id, amount, payment_method, payment_status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *`,
            [req.user.userId, rental.rental_id, totalAmount, method]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Rental booking created successfully',
            rental,
            payment: paymentResult.rows[0],
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Rental transaction ROLLED BACK:', err.message);
        if (err.message && err.message.includes('cannot create booking with past start date')) {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    } finally {
        client.release();
    }
};


// PUT /api/v1/rentals/:id/status (admin)
const updateRentalStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'active', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Check current status
        const currentResult = await query('SELECT status FROM rental_bookings WHERE rental_id = $1', [req.params.id]);
        if (currentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Rental booking not found.' });
        }
        const currentStatus = currentResult.rows[0].status;

        // Prevent invalid transitions
        if (currentStatus === 'completed' || currentStatus === 'cancelled') {
            return res.status(400).json({ error: `Cannot change status of a ${currentStatus} rental.` });
        }

        if (status === 'active' && currentStatus !== 'pending') {
            return res.status(400).json({ error: 'Only pending rentals can be started (moved to active).' });
        }

        if (status === 'completed' && currentStatus !== 'active') {
            return res.status(400).json({ error: 'Only active rentals can be completed (returned).' });
        }

        const result = await query(
            `UPDATE rental_bookings SET status = $1 WHERE rental_id = $2 RETURNING *`,
            [status, req.params.id]
        );

        res.json({
            message: `Rental marked as ${status}`,
            rental: result.rows[0],
            note: status === 'active' ? 'Vehicle is now unavailable.' : status === 'completed' ? 'Vehicle is now available and payment marked as complete.' : ''
        });
    } catch (err) {
        next(err);
    }
};

// DELETE /api/v1/rentals/:id (customer cancel own OR admin
const cancelRental = async (req, res, next) => {
    try {
        const rental = await query('SELECT * FROM rental_bookings WHERE rental_id = $1', [req.params.id]);
        if (rental.rows.length === 0) {
            return res.status(404).json({ error: 'Rental booking not found.' });
        }

        const isOwner = rental.rows[0].customer_id === req.user.userId;
        const isAdmin = req.user.roles.includes('admin');
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (!['pending'].includes(rental.rows[0].status)) {
            return res.status(400).json({ error: 'Only pending rentals can be cancelled.' });
        }

        const result = await query(
            `UPDATE rental_bookings SET status = 'cancelled' WHERE rental_id = $1 RETURNING *`,
            [req.params.id]
        );

        res.json({ message: 'Rental cancelled', rental: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

module.exports = { getActiveRentals, listRentals, getRental, createRental, updateRentalStatus, cancelRental };
