const { query, getClient } = require('../config/database');

// GET /api/v1/rides
// (customer: own rides, driver: own drives, admin: all)

const listRides = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const isAdmin = req.user.roles.includes('admin');
        const isDriver = req.user.roles.includes('driver');

        let sql = `SELECT rb.*,
            c.full_name AS customer_name,
            d.full_name AS driver_name,
            v.model AS vehicle_model, v.licence_plate
            FROM ride_bookings rb
            JOIN users c ON rb.customer_id = c.user_id
            JOIN users d ON rb.driver_id = d.user_id
            JOIN vehicles v ON rb.vehicle_id = v.vehicle_id`;

        const conditions = [];
        const params = [];

        if (!isAdmin) {
            if (isDriver) {
                params.push(req.user.userId);
                conditions.push(`(rb.customer_id = $${params.length} OR rb.driver_id = $${params.length})`);
            } else {
                params.push(req.user.userId);
                conditions.push(`rb.customer_id = $${params.length}`);
            }
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
        res.json({ rides: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/rides/:id

const getRide = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT rb.*,
            c.full_name AS customer_name,
            d.full_name AS driver_name,
            v.model AS vehicle_model
            FROM ride_bookings rb
            JOIN users c ON rb.customer_id = c.user_id
            JOIN users d ON rb.driver_id = d.user_id
            JOIN vehicles v ON rb.vehicle_id = v.vehicle_id
            WHERE rb.ride_id = $1`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ride not found.' });
        }

        const ride = result.rows[0];
        const isAdmin = req.user.roles.includes('admin');
        if (!isAdmin && ride.customer_id !== req.user.userId && ride.driver_id !== req.user.userId) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        res.json({ ride });
    } catch (err) {
        next(err);
    }
};

// POST /api/v1/rides  (customer : transaction)
const bookRide = async (req, res, next) => {
    const client = await getClient();
    try {
        const { driver_id, vehicle_id, pickup_location, dropoff_location, fare, payment_method } = req.body;

        if (!driver_id || !vehicle_id || !pickup_location || !dropoff_location || !fare) {
            return res.status(400).json({
                error: 'driver_id, vehicle_id, pickup_location, dropoff_location, and fare are required.',
            });
        }

        await client.query('BEGIN');

        // 1. Verify the driver has 'driver' role
        const driverCheck = await client.query(
            `SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = $1 AND r.role_name = 'driver'`,
            [driver_id]
        );
        if (driverCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Specified driver_id is not a registered driver.' });
        }

        //lock and verify vehicle availability
        const vehicleResult = await client.query(
            'SELECT * FROM vehicles WHERE vehicle_id = $1 FOR UPDATE',
            [vehicle_id]
        );
        if (vehicleResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Vehicle not found.' });
        }
        if (!vehicleResult.rows[0].is_available) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Vehicle is currently unavailable.' });
        }

        //creating ride booking
        const rideResult = await client.query(
            `INSERT INTO ride_bookings
            (customer_id, driver_id, vehicle_id, pickup_location, dropoff_location, fare, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'active')
            RETURNING *`,
            [req.user.userId, driver_id, vehicle_id, pickup_location, dropoff_location, fare]
        );
        const ride = rideResult.rows[0];

        //creating payment record
        const method = payment_method || 'cash';
        const paymentResult = await client.query(
            `INSERT INTO ride_payments (user_id, ride_id, amount, payment_method, payment_status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *`,
            [req.user.userId, ride.ride_id, fare, method]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Ride booked successfully',
            ride,
            payment: paymentResult.rows[0],
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Ride transaction ROLLED BACK:', err.message);
        next(err);
    } finally {
        client.release();
    }
};


// PUT /api/v1/rides/:id/complete (driver)
const completeRide = async (req, res, next) => {
    try {
        const result = await query(
            `UPDATE ride_bookings
            SET status = 'completed', dropoff_time = NOW()
            WHERE ride_id = $1 AND driver_id = $2 AND status = 'active'
            RETURNING *`,
            [req.params.id, req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Active ride not found or you are not the assigned driver.' });
        }

        res.json({ message: 'Ride completed', ride: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

// PUT /api/v1/rides/:id/cancel (customer or admin)
const cancelRide = async (req, res, next) => {
    try {
        const ride = await query('SELECT * FROM ride_bookings WHERE ride_id = $1', [req.params.id]);
        if (ride.rows.length === 0) return res.status(404).json({ error: 'Ride not found.' });

        const isOwner = ride.rows[0].customer_id === req.user.userId;
        const isAdmin = req.user.roles.includes('admin');
        if (!isOwner && !isAdmin) 
            return res.status(403).json({ error: 'Access denied.' });

        if (ride.rows[0].status === 'completed') {
            return res.status(400).json({ error: 'Cannot cancel a completed ride.' });
        }

        const result = await query(
            `UPDATE ride_bookings SET status = 'cancelled' WHERE ride_id = $1 RETURNING *`,
            [req.params.id]
        );

        res.json({ message: 'Ride cancelled', ride: result.rows[0] });
    } catch (err) {
        next(err);
    }
};

module.exports = { listRides, getRide, bookRide, completeRide, cancelRide };
