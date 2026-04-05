const { query, getClient } = require('../config/database');

// Lazily get io from app module to avoid circular deps
const getIo = () => require('../server').io;

// POST /api/v1/ride-requests  (customer)
const createRequest = async (req, res, next) => {
    try {
        const { pickup_location, dropoff_location, fare_estimate } = req.body;
        if (!pickup_location || !dropoff_location) {
            return res.status(400).json({ error: 'pickup_location and dropoff_location are required.' });
        }

        // Simple dynamic fare estimation logic: Base 200 + (length of locations * 10)
        const est = fare_estimate || (200 + (pickup_location.length + dropoff_location.length) * 10);

        const result = await query(
            `INSERT INTO ride_requests (customer_id, pickup_location, dropoff_location, fare_estimate)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [req.user.userId, pickup_location, dropoff_location, est]
        );
        const rideRequest = result.rows[0];

        // Emit to all connected drivers
        try {
            getIo().to('drivers').emit('ride_request:new', rideRequest);
        } catch (_) { /* socket optional */ }

        res.status(201).json({ message: 'Ride request created', rideRequest });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/ride-requests/mine  (customer)
const getMyRequests = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT rr.*,
                d.full_name AS driver_name,
                d.phone AS driver_phone
             FROM ride_requests rr
             LEFT JOIN users d ON rr.assigned_driver_id = d.user_id
             WHERE rr.customer_id = $1
             ORDER BY rr.created_at DESC`,
            [req.user.userId]
        );
        res.json({ requests: result.rows });
    } catch (err) {
        next(err);
    }
};

// PUT /api/v1/ride-requests/:id/cancel  (customer)
const cancelRequest = async (req, res, next) => {
    try {
        const existing = await query('SELECT * FROM ride_requests WHERE request_id = $1', [req.params.id]);
        if (existing.rows.length === 0) return res.status(404).json({ error: 'Ride request not found.' });
        const rr = existing.rows[0];
        if (rr.customer_id !== req.user.userId) return res.status(403).json({ error: 'Access denied.' });
        if (rr.status !== 'pending') return res.status(400).json({ error: 'Only pending requests can be cancelled.' });

        const result = await query(
            `UPDATE ride_requests SET status = 'cancelled' WHERE request_id = $1 RETURNING *`,
            [req.params.id]
        );
        res.json({ message: 'Ride request cancelled', rideRequest: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/ride-requests/available  (driver)
const getAvailableRequests = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT rr.*,
                c.full_name AS customer_name,
                c.phone     AS customer_phone
             FROM ride_requests rr
             JOIN users c ON rr.customer_id = c.user_id
             WHERE rr.status = 'pending' AND rr.expires_at > NOW()
             ORDER BY rr.created_at ASC`
        );
        res.json({ requests: result.rows });
    } catch (err) {
        next(err);
    }
};

// PUT /api/v1/ride-requests/:id/accept  (driver) — transactional
const acceptRequest = async (req, res, next) => {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Lock the row; only this driver can proceed
        const rrResult = await client.query(
            `SELECT * FROM ride_requests WHERE request_id = $1 FOR UPDATE`,
            [req.params.id]
        );
        if (rrResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Ride request not found.' });
        }
        const rr = rrResult.rows[0];
        if (rr.status !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Ride request is no longer pending.' });
        }

        // Pick an available vehicle for the driver (first available)
        const vehicleResult = await client.query(
            `SELECT v.vehicle_id FROM vehicles v
             WHERE v.is_available = TRUE
             LIMIT 1
             FOR UPDATE SKIP LOCKED`
        );
        if (vehicleResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'No vehicles are currently available.' });
        }
        const vehicleId = vehicleResult.rows[0].vehicle_id;

        // Mark request as accepted
        const updatedRr = await client.query(
            `UPDATE ride_requests
             SET status = 'accepted', assigned_driver_id = $1
             WHERE request_id = $2
             RETURNING *`,
            [req.user.userId, req.params.id]
        );

        // Create ride_booking
        const fare = rr.fare_estimate || 500; // fallback fare
        const rideResult = await client.query(
            `INSERT INTO ride_bookings
             (customer_id, driver_id, vehicle_id, pickup_location, dropoff_location, fare, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'active')
             RETURNING *`,
            [rr.customer_id, req.user.userId, vehicleId, rr.pickup_location, rr.dropoff_location, fare]
        );

        // Payment record
        await client.query(
            `INSERT INTO ride_payments (user_id, ride_id, amount, payment_method, payment_status)
             VALUES ($1, $2, $3, 'cash', 'pending')`,
            [rr.customer_id, rideResult.rows[0].ride_id, fare]
        );

        await client.query('COMMIT');

        const payload = {
            rideRequest: updatedRr.rows[0],
            ride: rideResult.rows[0],
        };

        // Notify the specific customer
        try {
            getIo().to(`customer_${rr.customer_id}`).emit('ride_request:updated', payload);
        } catch (_) { }

        res.json({ message: 'Ride request accepted', ...payload });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
};

// PUT /api/v1/ride-requests/:id/reject  (driver)
const rejectRequest = async (req, res, next) => {
    try {
        const rrResult = await query(
            `SELECT * FROM ride_requests WHERE request_id = $1`,
            [req.params.id]
        );
        if (rrResult.rows.length === 0) return res.status(404).json({ error: 'Ride request not found.' });
        const rr = rrResult.rows[0];
        if (rr.status !== 'pending') return res.status(409).json({ error: 'Ride request is no longer pending.' });

        const result = await query(
            `UPDATE ride_requests SET status = 'rejected', assigned_driver_id = $1 WHERE request_id = $2 RETURNING *`,
            [req.user.userId, req.params.id]
        );

        try {
            getIo().to(`customer_${rr.customer_id}`).emit('ride_request:updated', { rideRequest: result.rows[0] });
        } catch (_) { }

        res.json({ message: 'Ride request rejected', rideRequest: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

module.exports = { createRequest, getMyRequests, cancelRequest, getAvailableRequests, acceptRequest, rejectRequest };
