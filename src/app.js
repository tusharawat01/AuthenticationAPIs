const express = require('express');
// const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const db = require('./config/db.js'); // Import the db pool
const { createAdminAccount } = require('./controllers/userController.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/test', (req, res) => {
    res.status(200).send('<h1>Hello Everything is Okayy!!</h1>')
})

// Function to start the server
const startServer = async () => {
    try {
        await db.getConnection(); // Test the connection to the database
        console.log('Connected to the database.');
        
        await createAdminAccount(); // Ensure admin account is created
        console.log('Admin account created (if it did not exist).');
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error during server startup:', error);
        process.exit(1); // Exit the process if there's an error
    }
};

// Start the server
startServer();
