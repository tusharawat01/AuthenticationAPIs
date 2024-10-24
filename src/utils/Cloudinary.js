const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'  // Auto-detect the file type (image, video, etc.)
        });

        // File uploaded successfully, remove the local file
        fs.unlinkSync(localFilePath);
        return response;  // Return Cloudinary response (including URL)

    } catch (error) {
        console.error("Error while uploading to Cloudinary:", error);

        // Remove local file if upload failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};



// Export functions for use in other files
module.exports = uploadOnCloudinary;
