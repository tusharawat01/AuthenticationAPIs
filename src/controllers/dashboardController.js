exports.customerDashboard = (req, res) => {
    res.status(200).json({ message: 'Welcome to the Customer Dashboard!' });
};

exports.serviceProviderDashboard = (req, res) => {
    res.status(200).json({ message: 'Welcome to the Service Provider Dashboard!' });
};

exports.adminDashboard = (req, res) => {
    res.status(200).json({ message: 'Welcome to the Admin Dashboard!' });
};
