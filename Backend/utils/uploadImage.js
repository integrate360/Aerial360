import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import multerStorageCloudinary from "multer-storage-cloudinary";
const CloudinaryStorage = multerStorageCloudinary?.CloudinaryStorage || multerStorageCloudinary;


cloudinary.config({
  cloud_name: process.env.Cloudname,
  api_key: process.env.APIkey,
  api_secret: process.env.APIsecret,
});

// Set up Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "airbound",
    allowed_formats: ["jpg", "jpeg", "png", "gif"], 
  },
});

const upload = multer({ storage });

// Upload route handling
const handleUpload = (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: "Upload failed", details: err });
    }

    // The uploaded image's URL from Cloudinary
    const image = req.file.path; // This is the URL that Cloudinary returns

    res.status(200).json({
      message: "Image uploaded successfully",
      image: image, // Send back the full URL
    });
  });
};

export { upload, handleUpload };
