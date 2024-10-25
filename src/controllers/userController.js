const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel.js');
const MailChecker = require('mailchecker');
const otpGenerator =  require("otp-generator");
const sendEmail = require("../service/sendMail.js");
const db = require('../config/db');
const { promisify } = require('util');
const uploadOnCloudinary  =  require("../utils/Cloudinary.js");


// Register a user
exports.registerUser = async (req, res) => {
    const userData = req.body;

    try {

        // Check if user already exists
        const existingUser = await userModel.findUserByEmail(userData.email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Check for uploaded images
        let avatarLocalPath;
        if (req.files && req.files.photo1 && req.files.photo1.length > 0) {
            avatarLocalPath = req.files.photo1[0].path;
            // console.log("avatarLocalPath : ",avatarLocalPath)
        } else {
            return res.status(400).json({ message: 'Avatar is required' });
        }

        let coverImageLocalPath;
        if (req.files && req.files.photo2 && req.files.photo2.length > 0) {
            coverImageLocalPath = req.files.photo2[0].path;
            // console.log("coverImageLocalPath : ",coverImageLocalPath)
        }else{
            return res.status(400).json({ message: 'Cover Image is required' });
        }
        
        // Upload images to Cloudinary
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (!avatar) {
            return res.status(400).json({ message: 'Avatar File is required' });
        }
       
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage) {
            return res.status(400).json({ message: 'coverImage File is required' });
        }

        // Set the uploaded URLs in userData
        userData.photo1 = avatar?.url || "";
        userData.photo2 = coverImage?.url || "";
       
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        // Create user in the database
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

        await userModel.createUser(adminData);
        console.log('Admin account created successfully');
    } catch (err) {
        console.error('Error creating admin account:', err.message);
    }
};

//OTP sent to mail
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
                        <h2>Forget Password</h2>
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

//Confirmation of OTP
exports.verifyForgotPassOTP = async (req, res) => {
    try {
        const { otp, token} = req.body;

        // const token = req.headers.forgotauth || (req.headers.cookie && req.headers.cookie.split('forgotAuth=')[1]);

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

//Create a new Password
exports.updatePassword = async (req, res) => {
    try {
        const { newPassword, token } = req.body;
        // const token = req.headers.changePassToken || (req.headers.cookie && req.headers.cookie.split('changePassToken=')[1]);
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

// // Update Profile Controller
// exports.updateProfile = async (req, res) => {
//     try {
//         const { id } = req.user; 
        
//         const { 
//             first_name, 
//             last_name, 
//             gender, 
//             dob, 
//             house_flat, 
//             area_society, 
//             city, 
//             state, 
//             country, 
//             pin_code 
//         } = req.body;

//         // Initialize arrays for the query and values
//         let updates = [];
//         let values = [];

//         // Check each field and add to the query if it is explicitly provided (not undefined)
//         if (first_name !== undefined) {
//             updates.push("first_name = ?");
//             values.push(first_name);
//         }
//         if (last_name !== undefined) {
//             updates.push("last_name = ?");
//             values.push(last_name);
//         }
//         if (gender !== undefined) {
//             updates.push("gender = ?");
//             values.push(gender);
//         }
//         if (dob !== undefined) {
//             updates.push("dob = ?");
//             values.push(dob);
//         }
//         if (house_flat !== undefined) {
//             updates.push("house_flat = ?");
//             values.push(house_flat);
//         }
//         if (area_society !== undefined) {
//             updates.push("area_society = ?");
//             values.push(area_society);
//         }
//         if (city !== undefined) {
//             updates.push("city = ?");
//             values.push(city);
//         }
//         if (state !== undefined) {
//             updates.push("state = ?");
//             values.push(state);
//         }
//         if (country !== undefined) {
//             updates.push("country = ?");
//             values.push(country);
//         }
//         if (pin_code !== undefined) {
//             updates.push("pin_code = ?");
//             values.push(pin_code);
//         }

//         // If no fields are provided to update, return an error
//         if (updates.length === 0) {
//             console.log("No fields provided for update");
//             return res.status(400).json({ message: 'No fields provided for update' });
//         }

//         // Build the query string by joining all updates
//         let query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
//         values.push(id);  // Add user ID to the values

//         // console.log("Generated SQL Query: ", query);
//         // console.log("Values: ", values);

//         // Execute the SQL query
//         const [result] = await db.query(query, values);
        
//         // console.log("SQL Query Result: ", result);

//         // Respond with success if rows were affected
//         if (result.affectedRows > 0) {
//             console.log("Profile updated successfully");
//             return res.status(200).json({ message: 'Profile updated successfully' });
//         } else {
//             console.log("No rows updated");
//             return res.status(400).json({ message: 'No rows updated' });
//         }

//     } catch (err) {
//         console.error("Error updating profile: ", err);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

// //Update Avatar(photo1)
// exports.updateAvatar = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         // Handle avatar update
//         let avatarUrl = null;
//         if (req.file) { 
//             const avatarLocalPath = req.file.path;
//             // console.log("avatarLocalPath : ", avatarLocalPath)
//             const uploadResponse = await uploadOnCloudinary(avatarLocalPath);
            
//             if (uploadResponse && uploadResponse.url) {
//                 avatarUrl = uploadResponse.url; // Get the URL of the uploaded image
//             } else {
//                 return res.status(400).json({ message: 'Error uploading avatar to Cloudinary' });
//             }
//         } else {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         // SQL query for avatar update only
//         const query = `
//             UPDATE users
//             SET photo1 = ?
//             WHERE id = ?
//         `;

//         const values = [avatarUrl, userId];


//         // Execute SQL update
//         const [result] = await db.query(query, values);
     
//         return res.status(200).json({ 
//             message: 'Avatar updated successfully', 
//         });
        

//     } catch (error) {
//         console.error('Error updating avatar:', error);
//         return res.status(500).json({ message: 'Server error, please try again later' });
//     }
// };

// //Update CoverImage(photo2)
// exports.updateCoverImage = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         // Handle coverImage update
//         let coverImageUrl = null;
//         if (req.file) { // If a new coverImage is uploaded
//             const coverImageLocalPath = req.file.path;
//             // console.log("coverImageLocalPath : ", coverImageLocalPath)
//             const uploadResponse = await uploadOnCloudinary(coverImageLocalPath);
            
//             if (uploadResponse && uploadResponse.url) {
//                 coverImageUrl = uploadResponse.url; 
//             } else {
//                 return res.status(400).json({ message: 'Error uploading avatar to Cloudinary' });
//             }
//         } else {
//             return res.status(400).json({ message: 'No file uploaded' });
//         }

//         // SQL query for avatar update only
//         const query = `
//             UPDATE users
//             SET photo2 = ?
//             WHERE id = ?
//         `;

//         const values = [coverImageUrl, userId];

//         // Execute SQL update
//         const [result] = await db.query(query, values);

//         return res.status(200).json({ 
//             message: 'coverImage updated successfully', 
//         });
        

//     } catch (error) {
//         console.error('Error updating coverImage:', error);
//         return res.status(500).json({ message: 'Server error, please try again later' });
//     }
// };


//update User in single api
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.user;

        // Profile data
        const { first_name, last_name, gender, dob, house_flat, area_society, city, state, country, pin_code } = req.body;

        // Files for avatar and cover image
        const avatarFile = req.files?.photo1 ? req.files.photo1[0] : null;
        const coverImageFile = req.files?.photo2 ? req.files.photo2[0] : null;

        // Track if any updates were made
        let updatePerformed = false;

        // Profile data update
        let profileUpdates = [];
        let profileValues = [];

        if (first_name) { profileUpdates.push("first_name = ?"); profileValues.push(first_name); }
        if (last_name) { profileUpdates.push("last_name = ?"); profileValues.push(last_name); }
        if (gender) { profileUpdates.push("gender = ?"); profileValues.push(gender); }
        if (dob) { profileUpdates.push("dob = ?"); profileValues.push(dob); }
        if (house_flat) { profileUpdates.push("house_flat = ?"); profileValues.push(house_flat); }
        if (area_society) { profileUpdates.push("area_society = ?"); profileValues.push(area_society); }
        if (city) { profileUpdates.push("city = ?"); profileValues.push(city); }
        if (state) { profileUpdates.push("state = ?"); profileValues.push(state); }
        if (country) { profileUpdates.push("country = ?"); profileValues.push(country); }
        if (pin_code) { profileUpdates.push("pin_code = ?"); profileValues.push(pin_code); }

        // Execute profile update if there are fields to update
        if (profileUpdates.length > 0) {
            let profileQuery = `UPDATE users SET ${profileUpdates.join(', ')} WHERE id = ?`;
            profileValues.push(id);
            await db.query(profileQuery, profileValues);
            console.log("Profile updated successfully");
            updatePerformed = true;
        }

        // Handle avatar upload
        if (avatarFile) {
            const avatarLocalPath = avatarFile.path;
            const avatarUpload = await uploadOnCloudinary(avatarLocalPath);

            if (avatarUpload && avatarUpload.url) {
                const avatarQuery = `UPDATE users SET photo1 = ? WHERE id = ?`;
                await db.query(avatarQuery, [avatarUpload.url, id]);
                console.log("Avatar updated successfully");
                updatePerformed = true;
            } else {
                return res.status(400).json({ message: 'Error uploading avatar to Cloudinary' });
            }
        }

        // Handle cover image upload
        if (coverImageFile) {
            const coverImageLocalPath = coverImageFile.path;
            const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath);

            if (coverImageUpload && coverImageUpload.url) {
                const coverImageQuery = `UPDATE users SET photo2 = ? WHERE id = ?`;
                await db.query(coverImageQuery, [coverImageUpload.url, id]);
                console.log("Cover image updated successfully");
                updatePerformed = true;
            } else {
                return res.status(400).json({ message: 'Error uploading cover image to Cloudinary' });
            }
        }

        // If no updates were made, return an error
        if (!updatePerformed) {
            return res.status(400).json({ message: 'No data provided for update' });
        }

        return res.status(200).json({ message: 'Update successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

