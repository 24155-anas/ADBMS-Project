const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/rentals');

const router = express.Router();

router.use(authenticate);

router.get('/active', authorize('admin'), ctrl.getActiveRentals);
router.get('/', ctrl.listRentals);
router.get('/:id', ctrl.getRental);
router.post('/', authorize('customer'), ctrl.createRental);
router.put('/:id/status', authorize('admin'), ctrl.updateRentalStatus);
router.delete('/:id', ctrl.cancelRental);

module.exports = router;
