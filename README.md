# Role-Based Authentication System

This project implements a role-based authentication system using Node.js, Express, MySQL, and JWT. It provides separate endpoints for customer and service provider registration and login, as well as admin login functionality.

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
