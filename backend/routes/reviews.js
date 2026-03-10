const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/reviews');

const router = express.Router();

// small note: static paths (/vehicle-stats, /driver-earnings) must be before /:id
// to prevent Express treating those strings as a dynamic :id param
router.get('/', ctrl.listReviews);
router.get('/vehicle-stats', ctrl.getVehicleStats);
router.get('/driver-earnings', authenticate, authorize('admin'), ctrl.getDriverEarnings);
router.get('/:id', ctrl.getReview);


router.post('/', authenticate, authorize('customer'), ctrl.createReview);
router.delete('/:id', authenticate, ctrl.deleteReview);

module.exports = router;
