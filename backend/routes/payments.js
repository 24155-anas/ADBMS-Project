const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/payments');

const router = express.Router();

router.use(authenticate);

router.get('/rentals', ctrl.getRentalPayments);
router.get('/rides', ctrl.getRidePayments);
router.get('/carpools', ctrl.getCarpoolPayments);
router.get('/summary', authorize('admin'), ctrl.getPaymentSummary);
router.put('/rentals/:id/status', authorize('admin'), ctrl.updateRentalPaymentStatus);
router.put('/rides/:id/status', authorize('admin'), ctrl.updateRidePaymentStatus);
router.put('/carpools/:id/status', authorize('admin'), ctrl.updateCarpoolPaymentStatus);

module.exports = router;
