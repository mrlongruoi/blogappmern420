const express = require("express");
const router = express.Router();
const {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getPostBySlug,
  getPostsByTag,
  searchPosts,
  incrementView,
  likePost,
  getTopPosts,
} = require("../controllers/blogPostController");
const { protect } = require("../middlewares/authMiddleware");

// Admin-only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Chỉ có quyền truy cập của quản trị viên" });
  }
};

router.get("/", getAllPosts);                 // Xử lý cho GET /api/posts
router.get("/trending", getTopPosts);         // Xử lý cho GET /api/posts/trending
router.get("/search", searchPosts);           // Xử lý cho GET /api/posts/search

// CÁC ROUTE ĐỘNG (CÓ THAM SỐ) ĐẶT XUỐNG DƯỚI
router.get("/slug/:slug", getPostBySlug);
router.get("/tag/:tag", getPostsByTag);

// ROUTE TẠO MỚI (POST)
router.post("/", protect, adminOnly, createPost);

// CÁC ROUTE CẬP NHẬT/XÓA/TƯƠNG TÁC VỚI ID CỤ THỂ
router.put("/:id", protect, adminOnly, updatePost);
router.delete("/:id", protect, adminOnly, deletePost);
router.post("/:id/view", incrementView);
router.post("/:id/like", protect, likePost);

module.exports = router;
