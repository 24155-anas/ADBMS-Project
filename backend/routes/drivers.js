const express = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/drivers');

const router = express.Router();
router.use(authenticate);

router.get('/available', ctrl.getAvailableDrivers);

module.exports = router;
