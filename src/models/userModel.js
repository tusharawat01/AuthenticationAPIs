const db = require('../config/db');

// Create a new user
exports.createUser = async (userData) => {
    const query = `
        INSERT INTO users (first_name, last_name, gender, dob, email, password, role, house_flat, area_society, city, state, country, pin_code, photo1, photo2)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        userData.first_name, userData.last_name, userData.gender, userData.dob, userData.email, userData.password, userData.role,
        userData.house_flat, userData.area_society, userData.city, userData.state, userData.country, userData.pin_code,
        userData.photo1, userData.photo2
    ];

    const [result] = await db.query(query, values);
    return result;
};

// Find user by email
exports.findUserByEmail = async (email) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query(query, [email]);
    return rows[0]; // Return the first user found
};
