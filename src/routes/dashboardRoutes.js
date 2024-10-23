const express = require('express');
const router = express.Router();
const { verifyRole } = require('../middlewares/roleMiddleware.js');
const dashboardController = require('../controllers/dashboardController.js');

// Customer dashboard (role: customer)
router.get('/customer-dashboard', verifyRole('customer'), dashboardController.customerDashboard);

// Service provider dashboard (role: service_provider)
router.get('/service-provider-dashboard', verifyRole('service_provider'), dashboardController.serviceProviderDashboard);

// Admin dashboard (role: admin)
router.get('/admin-dashboard', verifyRole('admin'), dashboardController.adminDashboard);

module.exports = router;
