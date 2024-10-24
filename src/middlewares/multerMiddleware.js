const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Optionally generate a unique name here
    }
});

// Create a Multer instance and export it
const upload = multer({ storage: storage });

module.exports = upload; // Export the configured multer instance
