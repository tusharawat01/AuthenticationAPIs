const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
const MailChecker = require('mailchecker');
const otpGenerator =  require("otp-generator");
const sendEmail = require("../service/sendMail.js");
const db = require('../config/db');
const { uploadOnCloudinary } =  require("../utils/Cloudinary.js");


// Register a user
exports.registerUser = async (req, res) => {
    const userData = req.body;

    try {
        const existingUser = await userModel.findUserByEmail(userData.email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

    //Check for images ,check for avatar (save image or file to diskStorage or localPath of multer and avatar is required)
    // console.log("Req files : ", req.files);
    // const avatarLocalPath = req.files?.photo1[0]?.path;
    // const coverImageLocalPath = req.files?.photo2[0]?.path;

    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.photo1) && req.files.photo1.length > 0) {
        avatarLocalPath = req.files.photo1[0].path;

    }

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.photo2) && req.files.photo2.length > 0) {
        coverImageLocalPath = req.files.photo2[0].path;

    }

    //5.) Upload them to cloudinary (avatar is required to upload)
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    userData.photo1 = avatar?.url || "";
    userData.photo2 = coverImage?.url || "";

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


exports.generateAndSendForgotPasswordOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Please provide an email"
            });
        }

        if (!MailChecker.isValid(email)) {
            return res.status(400).json({
                message: "Disposable mail is not allowed"
            });
        }

          // Check if user exists in the database
    const userQuery = `SELECT email FROM users WHERE email = ?`;
    const [user] = await db.query(userQuery, [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: "User not found." });
    }


        const generatedEmailOTP = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });

        const expirationTime = new Date(Date.now() + 5 * 60 * 1000);
        const hashedOTP = await bcrypt.hash(generatedEmailOTP, 10);
        const token = jwt.sign({ email, expirationTime, hashedOTP }, process.env.JWT_SECRET);


        await sendEmail({
            from: "Tushar <tushar7314tr@gmail.com>",
            to: email,
            subject: `Forgot Password - OTP: ${generatedEmailOTP}`,
            text: `Your OTP for resetting the password is: ${generatedEmailOTP}. It is valid for 5 minutes.`,
            html: `
            <html lang="en">
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; }
                    .header { background-color: #23a3df; color: #fff; padding: 10px 20px; text-align: center; }
                    .otp { background-color: #23a3df; color: #fff; padding: 10px; font-size: 18px; text-align: center; margin: 20px 0; }
                    .footer { text-align: center; padding: 10px; color: #777; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>AERO2ASTRO Tech</h2>
                    </div>
                    <p>Hello,</p>
                    <p>Your OTP for resetting the password is:</p>
                    <div class="otp">${generatedEmailOTP}</div>
                    <p>This OTP is valid for 5 minutes. Ignore if you did not request this.</p>
                    <div class="footer">
                        &copy; 2024 AERO2ASTRO Tech
                    </div>
                </div>
            </body>
            </html>`
        });
        
     
        res.status(200).json({ message: "Check email for OTP", token: token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error, please try again!" });
    }
};

exports.verifyForgotPassOTP = async (req, res) => {
    try {
        const { otp } = req.body;

        const token = req.headers.forgotauth || (req.headers.cookie && req.headers.cookie.split('forgotAuth=')[1]);

        if (!otp || !token) {
            return res.status(400).json({ message: "OTP and token is required" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (Date.now() > decodedToken.expirationTime) {
            return res.status(400).json({ message: "OTP expired. Please try again!" });
        }

        const isOTPValid = await bcrypt.compare(otp, decodedToken.hashedOTP);

        if (!isOTPValid) {
            return res.status(400).json({ message: "Invalid OTP. Please try again!" });
        }

        const changePassToken = jwt.sign(
            { email: decodedToken.email },
            process.env.JWT_SECRET,
            { expiresIn: "10m" }
        );

        res.status(200).json({ message: "OTP verified successfully", token: changePassToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error, please try again!" });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const token = req.headers.changePassToken || (req.headers.cookie && req.headers.cookie.split('changePassToken=')[1]);
        if (!token) {
            return res.status(400).json({ message: "Something went wrong kindly contact the support team or Try Again!" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!newPassword || !decodedToken.email) {
            return res.status(400).json({ message: "New password and email are required" });
        }

        if (Date.now() > decodedToken.expirationTime) {
            return res.status(400).json({ message: "Token expired. Please try again!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

         // Update the password in the SQL database
        const updatePasswordQuery = `UPDATE users SET password = ? WHERE email = ?`;
        await db.query(updatePasswordQuery, [hashedPassword, decodedToken.email]);

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error, please try again!" });
    }
};

// Update Profile Controller
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.user;  // Assuming you're using a JWT for authentication and have middleware for user extraction
        const { first_name, last_name, gender, dob, house_flat, area_society, city, state, country, pin_code } = req.body;

        const query = `
            UPDATE users
            SET first_name = ?, last_name = ?, gender = ?, dob = ?, house_flat = ?, area_society = ?, city = ?, state = ?, country = ?, pin_code = ?
            WHERE id = ?
        `;
        const values = [first_name, last_name, gender, dob, house_flat, area_society, city, state, country, pin_code, id];

        await promisify(db.query).bind(db)(query, values);

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, email, house_flat, area_society, city, state, country, pin_code } = req.body;
        
        // Handle avatar update
        let avatarUrl = null;
        if (req.file) { // If a new avatar is uploaded
            const avatarLocalPath = req.file.path;
            const uploadResponse = await uploadOnCloudinary(avatarLocalPath);
            
            if (uploadResponse && uploadResponse.url) {
                avatarUrl = uploadResponse.url; // Get the URL of the uploaded image
            } else {
                return res.status(400).json({ message: 'Error uploading avatar to Cloudinary' });
            }
        }

        // SQL query for profile update
        const query = `
            UPDATE users
            SET first_name = ?, last_name = ?, email = ?, house_flat = ?, area_society = ?, city = ?, state = ?, country = ?, pin_code = ?, avatar = ?
            WHERE id = ?
        `;

        const values = [
            first_name, last_name, email, house_flat, area_society, city, state, country, pin_code, avatarUrl || null, userId
        ];

        // Execute SQL update
        const [result] = await db.query(query, values);

        if (result.affectedRows > 0) {
            // Fetch the updated user profile
            const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
            
            // Return success response
            return res.status(200).json({ 
                message: 'Profile updated successfully', 
                user: updatedUser[0] // Return the updated user
            });
        } else {
            return res.status(400).json({ message: 'Profile update failed' });
        }

    } catch (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ message: 'Server error, please try again later' });
    }
};

