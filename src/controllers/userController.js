const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');

// Register a user
exports.registerUser = async (req, res) => {
    const userData = req.body;

    try {
        const existingUser = await userModel.findUserByEmail(userData.email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        const result = await userModel.createUser(userData);
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Login a user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Admin login
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // You should have a fixed email and password for admin in your environment variables
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (email === adminEmail && password === adminPassword) {
            const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Admin login successful', token });
        }

        res.status(401).json({ message: 'Invalid admin credentials' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Create Admin Account
exports.createAdminAccount = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    try {
        const existingAdmin = await userModel.findUserByEmail(adminEmail);
        if (existingAdmin) {
            console.log('Admin account already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminData = { email: adminEmail, password: hashedPassword, role: 'admin' };

        await User.createUser(adminData);
        console.log('Admin account created successfully');
    } catch (err) {
        console.error('Error creating admin account:', err.message);
    }
};
