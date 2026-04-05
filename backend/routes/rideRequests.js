const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/rideRequests');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize('customer'), ctrl.createRequest);
router.get('/mine', authorize('customer'), ctrl.getMyRequests);
router.put('/:id/cancel', authorize('customer'), ctrl.cancelRequest);
router.get('/available', authorize('driver'), ctrl.getAvailableRequests);
router.put('/:id/accept', authorize('driver'), ctrl.acceptRequest);
router.put('/:id/reject', authorize('driver'), ctrl.rejectRequest);

module.exports = router;
