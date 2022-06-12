var express = require('express');
var router = express.Router();
const { isAuth } = require('../middlewares/auth');
const userController = require('../controllers/users');
const { signUp, signIn, getProfile, editProfile, updatePassword } = userController;

router.post('/sign_up', signUp);
router.post('/sign_in', signIn);

router.use(isAuth);
router.get('/profile', getProfile);
router.patch('/profile', editProfile);
router.patch('/updatePassword', updatePassword);

module.exports = router;
