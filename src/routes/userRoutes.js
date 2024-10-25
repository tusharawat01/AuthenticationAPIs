const express = require('express');
const userController = require('../controllers/userController.js');
const { verifyToken } = require('../middlewares/authMiddleware.js');
const upload  = require("../middlewares/multerMiddleware.js")

const router = express.Router();

// Customer routes
router.post('/customer/register',  upload.fields([
    {
        name: "photo1",
        maxCount: 1
    },
    {
        name: "photo2",
        maxCount: "1"
    }
]

), userController.registerUser);
router.post('/customer/login', userController.loginUser);

// Service provider routes
router.post('/service-provider/register',   upload.fields([
    {
        name: "photo1",
        maxCount: 1
    },
    {
        name: "photo2",
        maxCount: "1"
    }
]

), userController.registerUser);
router.post('/service-provider/login', userController.loginUser);

// Admin route
router.post('/admin/login', userController.adminLogin);

//forget Password
router.post("/user/forgot/password",userController.generateAndSendForgotPasswordOTP);
router.post("/user/verify/forgot/otp",userController.verifyForgotPassOTP);
router.post("/user/password/update",userController.updatePassword);

//Update Profile
// router.put('/update-profile', verifyToken, userController.updateProfile);
// router.put('/update-avatar', verifyToken, upload.single('photo1'), userController.updateAvatar);
// router.put('/update-cover-image', verifyToken, upload.single('photo1'), userController.updateCoverImage);

//Update User in single Route and API
router.put('/update-user', verifyToken, upload.fields([
    { name: 'photo1', maxCount: 1 },
    { name: 'photo2', maxCount: 1 }
]), userController.updateUser);

module.exports = router;
