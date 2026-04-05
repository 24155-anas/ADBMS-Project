const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/analytics');

const router = express.Router();
router.use(authenticate, authorize('admin'));

router.get('/revenue', ctrl.getRevenue);
router.get('/driver-earnings', ctrl.getDriverEarnings);
router.get('/vehicle-stats', ctrl.getVehicleStats);
router.get('/summary', ctrl.getSummary);

module.exports = router;
