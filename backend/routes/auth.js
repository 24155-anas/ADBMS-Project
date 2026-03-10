const express = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/auth');

const router = express.Router();


// router.METHOD('path', handlerFunction)
router.post('/register',ctrl.register);
router.post('/login', ctrl.login);

//below routes rewquire authentication aswell
//in simpler words user must be logged in 
router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, ctrl.updateProfile);
router.put('/change-password', authenticate, ctrl.changePassword);

module.exports = router;
