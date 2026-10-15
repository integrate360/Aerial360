// utils/cloudinary.js

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary with the environment variable
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL, // Use the URL from the .env file
});

export default cloudinary;
