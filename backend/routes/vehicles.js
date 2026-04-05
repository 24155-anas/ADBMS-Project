const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/vehicles');

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const router = express.Router();

router.get('/', ctrl.listVehicles);
router.get('/:id', ctrl.getVehicle);
router.get('/:id/reviews', ctrl.getVehicleReviews);

router.post('/', authenticate, authorize('admin'), upload.single('image'), ctrl.createVehicle);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), ctrl.updateVehicle);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteVehicle);

module.exports = router;
