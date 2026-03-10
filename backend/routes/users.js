const express = require('express');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ctrl = require('../controllers/users');

const router = express.Router();

//all routes me authentication hogi
router.use(authenticate);

router.get('/', authorize('admin'), ctrl.listUsers);
router.get('/:id', authorize('admin'), ctrl.getUser);
router.put('/:id', authorize('admin'), ctrl.updateUser);
router.put('/:id/role', authorize('admin'), ctrl.assignRole);
router.delete('/:id/role', authorize('admin'), ctrl.removeRole);
router.delete('/:id', authorize('admin'), ctrl.deactivateUser);

module.exports = router;
