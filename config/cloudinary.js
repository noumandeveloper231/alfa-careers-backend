import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (filePath, options = {}) => {
  const { folder = "users", isRaw = false } = options;

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: isRaw ? "raw" : "image",
      allowed_formats: isRaw
        ? ["pdf", "doc", "docx"]
        : ["jpg", "jpeg", "png", "webp"],
      transformation: !isRaw ? [{ width: 800, height: 600, crop: "limit" }] : undefined,
    });

    // Optionally remove local file after upload
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
};

export default cloudinary;