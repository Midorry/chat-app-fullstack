import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = Router();

// Cấu hình lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // lưu vào thư mục uploads
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => {
      // tạo tên file duy nhất
      return Date.now() + "-" + file.originalname.split(".")[0];
    },
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({ url: req.file.path });
  } catch (error) {
    console.error("Upload error object:", error);
    console.error("Upload error message:", error.message);
    console.error("Upload error stack:", error.stack);

    // Trường hợp Cloudinary trả về error chi tiết
    if (error.http_code || error.name || error.response) {
      console.error("Upload error details:", JSON.stringify(error, null, 2));
    }

    res.status(500).json({ error: error.message || "Upload failed" });
  }
});

export default router;
