import dotenv from "dotenv";
dotenv.config({ path: './.env' });
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadcloudinary = async (localFilePath) => {
    try {
      if (!localFilePath) {
        console.log("Invalid file path");
        return null;
      }
  
      console.log("Uploading file to Cloudinary:", localFilePath);
  
      // Upload to Cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
  
      console.log("File uploaded successfully:", response.url);
  
      // Delete the local file safely
      if (fs.existsSync(localFilePath)){
        fs.unlinkSync(localFilePath);
        console.log("Local file deleted:", localFilePath);
      }
  
      return response;
    } catch (error) {
      console.error("Cloudinary upload failed:", error.message);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log("Local file deleted after failure:", localFilePath);
      }
      return null;
    }
  };
  const deletecloudVideo = async(videoUrl) => {
    const publicId = urlParts.split(".mp4")[0]; // Remove file extension
    if (!publicId){
      console.log("unable to delate from cloud");
    }else{
      result = await cloudinary.uploader.destroy(publicId, resource_type="video")
      return result;
    }
    return null
  }
  
  export { uploadcloudinary ,deletecloudVideo};