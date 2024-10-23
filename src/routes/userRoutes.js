const express = require('express');
const userController = require('../controllers/userController.js');

const router = express.Router();

// Customer routes
router.post('/customer/register', userController.registerUser);
router.post('/customer/login', userController.loginUser);

// Service provider routes
router.post('/service-provider/register', userController.registerUser);
router.post('/service-provider/login', userController.loginUser);

// Admin route
router.post('/admin/login', userController.adminLogin);

module.exports = router;
