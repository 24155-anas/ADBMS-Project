const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/carpools');

const router = express.Router();

router.use(authenticate);

//carpool offers
router.get('/', ctrl.listOffers);
router.get('/mine', authorize('driver'), ctrl.listMyOffers);
router.get('/my-bookings', authorize('customer'), ctrl.listMyBookings);

router.post('/', authorize('driver'), ctrl.createOffer);
router.post('/book', authorize('customer'), ctrl.bookCarpool);

router.get('/:id', ctrl.getOffer);
router.put('/:id', authorize('driver'), ctrl.updateOffer);
router.put('/:id/complete', authorize('driver'), ctrl.completeOffer);
router.put('/bookings/:id/cancel', authorize('customer'), ctrl.cancelCarpoolBooking);

module.exports = router;
