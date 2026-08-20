import { v2 as cloudinary } from "cloudinary";

export function getPublicIdFromUrl(url) {
  // Remove the base URL up to /upload/
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;

  // Remove version and get path
  let path = parts[1]; // e.g. v1699999999/users/abc123.jpg
  // Remove version number if present
  path = path.replace(/^v\d+\//, ""); // users/abc123.jpg
  // Remove file extension
  path = path.replace(/\.[^/.]+$/, ""); // users/abc123

  return path; // this is the public_id
}

// Example: deleting a previous file
export const deletePreviousFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto" // "image" or "raw" depending on file type
    });
    console.log("Deleted:", result);
  } catch (err) {
    console.error("Error deleting file:", err);
  }
};
