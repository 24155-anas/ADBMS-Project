const { query } = require('../config/database');

const VEHICLE_MODELS = ['Toyota Corolla', 'Honda Civic', 'Suzuki Swift', 'KIA Sportage', 'Hyundai Tucson'];

// GET /api/v1/drivers/available
// Returns active drivers with simulated ETA and rating
const getAvailableDrivers = async (req, res, next) => {
    try {
        const result = await query(
            `SELECT u.user_id, u.full_name, u.phone
             FROM users u
             JOIN user_roles ur ON u.user_id = ur.user_id
             JOIN roles r       ON ur.role_id = r.role_id
             WHERE r.role_name = 'driver'
               AND u.is_active = TRUE
             ORDER BY RANDOM()
             LIMIT 10`
        );

        const drivers = result.rows.map((d) => ({
            driver_id: d.user_id,
            full_name: d.full_name,
            phone: d.phone,
            rating: (3.5 + Math.random() * 1.5).toFixed(1),          // 3.5 – 5.0
            eta_minutes: Math.floor(Math.random() * 15) + 2,              // 2 – 16 min
            vehicle_model: VEHICLE_MODELS[Math.floor(Math.random() * VEHICLE_MODELS.length)],
        }));

        res.json({ drivers });
    } catch (err) {
        next(err);
    }
};

module.exports = { getAvailableDrivers };
