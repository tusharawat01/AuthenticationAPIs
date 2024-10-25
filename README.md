# Task 1 Role-Based Authentication System

This project implements a role-based authentication system using Node.js, Express, MySQL, Cloudinary, Multer, and JWT. It provides separate endpoints for customer and service provider registration and login, as well as admin login functionality.

# Task 2 added Forgot Password, Update Profile & Update photos functionality

## Steps for Forgot Password
1. Send a otp to the given email (using nodemailer, otp-generator)
2. Confirm the OTP is correct or not
3. Finally update the Password and saved to databse in hashed form

## Steps for Update Profile
1. Receive a put request including header with token which received during login
2. Then used a middleware verifyToken to verify the Token and also will get user id which have to update
3. Then check for the feilds which have to update and save into array
4. Finally execut update query

## Steps for Update Photos Functionality
1. Create two seperate Api one for avatar(photo1) & another for coverImage(photo2)
2. Receive a put request with token in header and then verify using middleware.
3. Execute update query

## Steps for Update User(Avatar, Cover Image & Profile Data)
1. Created a put route in which a two middleware is passed one is for verify token & get user id and other is multer to upload
2. merge the all three api in one to create one api
3. if everthing ok at last send thr res "Updated successfully"

## Folder Structure

```plaintext
├── .gitignore                    # Git ignore file
├── .env                          # Secrets
├── .env.sample                   # Consists of secrets required in project
├── package.json                  # Node.js dependencies and scripts
├── public/temp/.gitkeep          # to save or upload file locally
src/
│
├── config/
│   ├── db.js                     # Database connection configuration file
│
├── controllers/
│   ├── userController.js         # Controller for user-related operations (registration, login)
│   └── dasboardController.js     # Controller for handling dashboad logic
│
├── models/
│   └── userModel.js              # User model for database operations (create, find user)
│
├── routes/
│   ├── dashboardRoutes.js        # Routes for dasboard controllers
│   ├── userRoutes.js             # Routes for authentication
│
├── middleware/
│   ├── authMiddleware.js         # Middleware for JWT verification   not used in project
│   ├── roleMiddleware.js         # Middleware for role checking
|   ├── multerMiddleWare.js       # Multer configuration
|
├── services/
│   ├── sendMail.js               # Configuration of nodemailer
|
├── utils/
│   ├── Cloudinary.js             # Configuration for cloudinary for file upload
│
└── app.js                        # Main application file
