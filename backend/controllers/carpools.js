const { query, getClient } = require('../config/database');

/////////rev
// GET /api/v1/carpools/offers
// const listOffers = async (req, res, next) => {
//     try {
//         //pagination
//         const { status, origin, destination, page = 1, limit = 20 } = req.query;
//         const offset = (page - 1) * limit;
//         let sql = ` SELECT co.*, d.full_name AS driver_name, v.model AS vehicle_model, v.licence_plate
//                     FROM carpool_offers co
//                     JOIN users d ON co.driver_id  = d.user_id
//                     JOIN vehicles v ON co.vehicle_id = v.vehicle_id`;


//         const conditions = [];
//         const params = [];
//         if (status) { 
//             params.push(status); conditions.push(`co.status = $${params.length}`); 
//         }
//         if (origin) { 
//             params.push(`%${origin}%`); conditions.push(`co.origin ILIKE $${params.length}`);
//         }
//         if (destination) { params.push(`%${destination}%`); conditions.push(`co.destination ILIKE $${params.length}`); }
//         if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
//         sql += ' ORDER BY co.departure_time DESC';
//         params.push(parseInt(limit, 10)); sql += ` LIMIT $${params.length}`;
//         params.push(parseInt(offset, 10)); sql += ` OFFSET $${params.length}`;
//         const result = await query(sql, params);
//         res.json({ offers: result.rows });
//     } catch (err) { next(err); }
// };

const listOffers = async (req, res, next) => {
    try {
        //read inputs
        const { status, origin, destination, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // base SQL
        let sql = `
            SELECT co.*, d.full_name AS driver_name, 
                   v.model AS vehicle_model, v.licence_plate
            FROM carpool_offers co
            JOIN users d ON co.driver_id  = d.user_id
            JOIN vehicles v ON co.vehicle_id = v.vehicle_id
        `;

        //optional filters
        const conditions = [];
        const params = [];

        if (status) {
            params.push(status);
            conditions.push(`co.status = $${params.length}`);
        }

        if (origin) {
            params.push(`%${origin}%`);
            conditions.push(`co.origin ILIKE $${params.length}`);
        }

        if (destination) {
            params.push(`%${destination}%`);
            conditions.push(`co.destination ILIKE $${params.length}`);
        }

        //attach filters if any
        if (conditions.length) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        //sort and paginate
        sql += ' ORDER BY co.departure_time DESC';

        params.push(parseInt(limit, 10));
        sql += ` LIMIT $${params.length}`;

        params.push(parseInt(offset, 10));
        sql += ` OFFSET $${params.length}`;

        const result = await query(sql, params);
        res.json({ offers: result.rows });

    } catch (err) {
        next(err);
    }
};



// GET /api/v1/carpools/offers/:id
// return specifi carpool offer abd its bookings by its id
const getOffer = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT co.*, d.full_name AS driver_name, v.model AS vehicle_model
            FROM carpool_offers co
            JOIN users d ON co.driver_id  = d.user_id
            JOIN vehicles v ON co.vehicle_id = v.vehicle_id
            WHERE co.carpool_id = $1`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Carpool offer not found.' });
        const bookings = await query(
            `SELECT cb.*, u.full_name AS passenger_name
            FROM carpool_bookings cb
            JOIN users u ON cb.passenger_id = u.user_id
            WHERE cb.carpool_id = $1 ORDER BY cb.booking_time`,
            [req.params.id]
        );

        res.json({ offer: result.rows[0], bookings: bookings.rows });
    } catch (err) {
        next(err);
    }
};

// POST /api/v1/carpools/offers (driver only)
const createOffer = async (req, res, next) => {
    try {
        const { vehicle_id, origin, destination, departure_time, available_seats, price_per_seat } = req.body;
        if (!vehicle_id || !origin || !destination || !departure_time || !available_seats || !price_per_seat) {
            return res.status(400).json({ error: 'vehicle_id, origin, destination, departure_time, available_seats, and price_per_seat are required.' });
        }
        const result = await query(
            `INSERT INTO carpool_offers (driver_id, vehicle_id, origin, destination, departure_time, available_seats, price_per_seat)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [req.user.userId, vehicle_id, origin, destination, departure_time, available_seats, price_per_seat]
        );
        res.status(201).json({ message: 'Carpool offer created', offer: result.rows[0] });
    } catch (err) { next(err); }
};

// PUT /api/v1/carpools/offers/:id (driver)
const updateOffer = async (req, res, next) => {
    try {
        const { departure_time, price_per_seat, status } = req.body;
        const result = await query(
            `UPDATE carpool_offers
            SET departure_time = COALESCE($1, departure_time),
            price_per_seat = COALESCE($2, price_per_seat),
            status = COALESCE($3, status)
            WHERE carpool_id = $4 AND driver_id = $5 RETURNING *`,
            [departure_time, price_per_seat, status, req.params.id, req.user.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Carpool offer not found or you are not the driver.' });
        res.json({ message: 'Carpool offer updated', offer: result.rows[0] });
    } catch (err) { next(err); }
};

// GET /api/v1/carpools/mine (driver)
const listMyOffers = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT co.*, v.model AS vehicle_model,
            (SELECT COUNT(*) FROM carpool_bookings WHERE carpool_id = co.carpool_id AND status = 'confirmed') AS passengers
            FROM carpool_offers co
            JOIN vehicles v ON co.vehicle_id = v.vehicle_id
            WHERE co.driver_id = $1 ORDER BY co.departure_time DESC`,
            [req.user.userId]
        );
        res.json({ offers: result.rows });
    } catch (err) { next(err); }
};

// PUT /api/v1/carpools/:id/complete (driver)
const completeOffer = async (req, res, next) => {
    try {
        const result = await query(
            `UPDATE carpool_offers SET status = 'completed'
             WHERE carpool_id = $1 AND driver_id = $2 AND status IN ('open', 'full') RETURNING *`,
            [req.params.id, req.user.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Open carpool offer not found or access denied.' });
        res.json({ message: 'Carpool marked as completed.', offer: result.rows[0] });
    } catch (err) { next(err); }
};

// GET /api/v1/carpools/my-bookings (customer)
const listMyBookings = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT cb.*, co.origin, co.destination, co.departure_time, co.price_per_seat, co.status AS offer_status,
             d.full_name AS driver_name, d.phone AS driver_phone
             FROM carpool_bookings cb
             JOIN carpool_offers co ON cb.carpool_id = co.carpool_id
             JOIN users d ON co.driver_id = d.user_id
             WHERE cb.passenger_id = $1 ORDER BY cb.booking_time DESC`,
            [req.user.userId]
        );
        res.json({ bookings: result.rows });
    } catch (err) { next(err); }
};

// POST /api/v1/carpools/bookings  (customer -> TRANSACTION)
// a customer books seats in carpool offer
const bookCarpool = async (req, res, next) => {
    const client = await getClient();
    try {
        const { carpool_id, seats_booked, payment_method } = req.body;
        if (!carpool_id || !seats_booked) return res.status(400).json({ error: 'carpool_id and seats_booked are required.' });

        await client.query('BEGIN');

        const offerResult = await client.query('SELECT * FROM carpool_offers WHERE carpool_id = $1 FOR UPDATE', [carpool_id]);
        if (offerResult.rows.length === 0) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Carpool offer not found.' }); }
        const offer = offerResult.rows[0];
        if (offer.status !== 'open') {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: `Carpool is ${offer.status}, cannot book.` });
        }

        const bookingResult = await client.query(
            `INSERT INTO carpool_bookings (carpool_id, passenger_id, seats_booked) VALUES ($1, $2, $3) RETURNING *`,
            [carpool_id, req.user.userId, seats_booked]
        );
        const booking = bookingResult.rows[0];

        const totalAmount = seats_booked * parseFloat(offer.price_per_seat);
        const method = payment_method || 'card';
        const paymentResult = await client.query(
            `INSERT INTO carpool_payments (user_id, carpool_booking_id, amount, payment_method, payment_status) VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
            [req.user.userId, booking.booking_id, totalAmount, method]
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Carpool seats booked successfully', booking, payment: paymentResult.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Carpool booking transaction ROLLED BACK:', err.message);

        if (err.message && err.message.includes('Not enough seats'))
            return res.status(409).json({ error: err.message });
        if (err.code === '23505')
            return res.status(409).json({ error: 'You have already booked this carpool.' });

        next(err);

    } finally {
        client.release();
    }
};

// PUT /api/v1/carpools/bookings/:id/cancel   (customer)
const cancelCarpoolBooking = async (req, res, next) => {
    try {
        //khali confirmed status pe cancel kra ya pending pe bhi tbd
        const result = await query(
            `UPDATE carpool_bookings SET status = 'cancelled'
            WHERE booking_id = $1 AND passenger_id = $2 AND status = 'confirmed' RETURNING *`,
            [req.params.id, req.user.userId]
        );
        if (result.rows.length === 0)
            return res.status(404).json({ error: 'Confirmed booking not found or you are not the passenger.' });

        res.json({ message: 'Carpool booking cancelled', booking: result.rows[0] });
    } catch (err) { next(err); }
};

module.exports = { listOffers, getOffer, createOffer, updateOffer, listMyOffers, completeOffer, listMyBookings, bookCarpool, cancelCarpoolBooking };
