const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/rides');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.listRides);
router.get('/:id', ctrl.getRide);
router.post('/', authorize('customer'), ctrl.bookRide);
router.put('/:id/complete', authorize('driver'), ctrl.completeRide);
router.put('/:id/cancel', ctrl.cancelRide);

module.exports = router;
