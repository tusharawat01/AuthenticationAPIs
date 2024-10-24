import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

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

// Function to delete a file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        // Ensure publicId is provided
        if (!publicId) {
            console.error("Public ID for Cloudinary deletion is missing");
            return null;
        }

        // Delete the file from Cloudinary using its public ID
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return response;  // Return Cloudinary deletion response

    } catch (error) {
        console.error("Error while deleting from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
