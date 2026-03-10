const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/carpools');

const router = express.Router();

router.use(authenticate);

//carpool offers
router.get('/offers', ctrl.listOffers);
router.get('/offers/:id', ctrl.getOffer);
router.post('/offers', authorize('driver'), ctrl.createOffer);
router.put('/offers/:id', authorize('driver'), ctrl.updateOffer);

//carpool bookings
router.get('/bookings', ctrl.listBookings);
router.post('/bookings', authorize('customer'), ctrl.bookCarpool);
router.put('/bookings/:id/cancel', ctrl.cancelCarpoolBooking);

module.exports = router;
