const { query } = require('../config/database');

// Helper: validate & parse period param
const VALID_PERIODS = { day: 'YYYY-MM-DD', week: 'IYYY-IW', month: 'YYYY-MM' };

// GET /api/v1/analytics/revenue?period=day|week|month
const getRevenue = async (req, res, next) => {
    try {
        const { period = 'month' } = req.query;
        if (!VALID_PERIODS[period]) {
            return res.status(400).json({ error: "period must be 'day', 'week', or 'month'." });
        }
        const fmt = VALID_PERIODS[period];

        const sql = `
            SELECT
                TO_CHAR(payment_time, '${fmt}') AS period,
                'rental' AS category,
                SUM(amount) AS total
            FROM rental_payments WHERE payment_status = 'completed'
            GROUP BY 1
            UNION ALL
            SELECT
                TO_CHAR(payment_time, '${fmt}') AS period,
                'ride' AS category,
                SUM(amount) AS total
            FROM ride_payments WHERE payment_status = 'completed'
            GROUP BY 1
            UNION ALL
            SELECT
                TO_CHAR(payment_time, '${fmt}') AS period,
                'carpool' AS category,
                SUM(amount) AS total
            FROM carpool_payments WHERE payment_status = 'completed'
            GROUP BY 1
            ORDER BY period DESC;
        `;

        const result = await query(sql);
        res.json({ revenue: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/analytics/driver-earnings
const getDriverEarnings = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT * FROM vw_driver_earnings ORDER BY total_earnings DESC`
        );
        res.json({ earnings: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/analytics/vehicle-stats
const getVehicleStats = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT * FROM vw_vehicle_review_stats ORDER BY avg_rating DESC NULLS LAST`
        );
        res.json({ stats: result.rows });
    } catch (err) {
        next(err);
    }
};

// GET /api/v1/analytics/summary  (dashboard KPIs)
const getSummary = async (req, res, next) => {
    try {
        const [users, vehicles, rides, revenue] = await Promise.all([
            query(`SELECT COUNT(*) AS count FROM users WHERE is_active = TRUE`),
            query(`SELECT COUNT(*) AS count FROM vehicles WHERE is_available = TRUE`),
            query(`SELECT COUNT(*) AS count FROM ride_bookings WHERE status = 'active'`),
            query(`SELECT COALESCE(SUM(amount),0) AS total FROM (
                        SELECT amount FROM rental_payments WHERE payment_status='completed'
                        UNION ALL
                        SELECT amount FROM ride_payments WHERE payment_status='completed'
                        UNION ALL
                        SELECT amount FROM carpool_payments WHERE payment_status='completed'
                   ) all_payments`),
        ]);
        res.json({
            active_users: parseInt(users.rows[0].count),
            available_vehicles: parseInt(vehicles.rows[0].count),
            active_rides: parseInt(rides.rows[0].count),
            total_revenue: parseFloat(revenue.rows[0].total),
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { getRevenue, getDriverEarnings, getVehicleStats, getSummary };
