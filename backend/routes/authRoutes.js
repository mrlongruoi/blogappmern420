
const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Auth Routes
router.post("/register", registerUser);   // Register User
router.post("/login", loginUser);         // Login User
router.get("/profile", protect, getUserProfile);  // Get User Profile


// === SỬA LẠI ROUTE NÀY ===
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  
  // Lấy trực tiếp URL đầy đủ từ Cloudinary qua req.file.path
  // và gửi về cho frontend
  res.status(200).json({ imageUrl: req.file.path });
});

module.exports = router;
