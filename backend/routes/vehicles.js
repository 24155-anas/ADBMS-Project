const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/vehicles');

const router = express.Router();

router.get('/', ctrl.listVehicles);
router.get('/:id', ctrl.getVehicle);
router.get('/:id/reviews', ctrl.getVehicleReviews);

router.post('/', authenticate, authorize('admin'), ctrl.createVehicle);
router.put('/:id', authenticate, authorize('admin'), ctrl.updateVehicle);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteVehicle);

module.exports = router;
