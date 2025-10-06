const mongoose = require("mongoose");
const cloudinary = require('cloudinary').v2;
const BlogPost = require("../models/BlogPost");

// @desc    Create a new blog post
// @route   POST /api/posts
// @access  Private (Admin only)
const createPost = async (req, res) => {
  try {
    const { title, content, coverImageUrl, tags, isDraft, generatedByAI } =
      req.body;

    const slug = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    const newPost = new BlogPost({
      title,
      slug,
      content,
      coverImageUrl,
      tags,
      author: req.user._id,
      isDraft,
      generatedByAI,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create post", error: err.message });
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/posts/:id
// @access  Private (Author or Admin)
const updatePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // (Logic kiểm tra quyền sở hữu của bạn đã tốt, giữ nguyên)
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    const updatedData = req.body;

    // === LOGIC XỬ LÝ ẢNH MỚI ===
    // Nếu có một coverImageUrl mới được gửi lên (có nghĩa là ảnh đã được thay đổi)
    // và nó khác với URL cũ
    if (updatedData.coverImageUrl && post.coverImageUrl !== updatedData.coverImageUrl) {
        // Kiểm tra xem ảnh cũ có tồn tại không trước khi xóa
        if (post.coverImageUrl) {
            // Trích xuất public_id từ URL đầy đủ của ảnh cũ
            // URL có dạng: .../upload/v12345/folder/filename.jpg
            const oldPublicId = post.coverImageUrl.split('/upload/')[1].split('.')[0];
            
            // Xóa ảnh cũ khỏi Cloudinary
            await cloudinary.uploader.destroy(oldPublicId);
        }
    }
    // === KẾT THÚC LOGIC XỬ LÝ ẢNH ===

    // Cập nhật slug nếu tiêu đề thay đổi
    if (updatedData.title) {
      updatedData.slug = updatedData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.json(updatedPost);
  } catch (err) {
    console.error("Update Post Error:", err); // Log lỗi ra để dễ gỡ rối
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/posts/:id
// @access  Private (Author or Admin)
const deletePost = async (req, res) => {
 try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    // (Thêm logic kiểm tra quyền sở hữu ở đây nếu cần)

    // === LOGIC XÓA ẢNH TRÊN CLOUDINARY ===
    if (post.coverImageUrl) {
        const publicId = post.coverImageUrl.split('/upload/')[1].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    }
    // === KẾT THÚC LOGIC XÓA ẢNH ===

    await post.deleteOne(); // Xóa bài viết khỏi DB
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete Post Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get blog posts by status (all, published, or draft) and include counts
// @route   GET /api/posts?status=published|draft|all&page=1
// @access  Public
const getAllPosts = async (req, res) => {
  try {
    const status = req.query.status || "published";
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    // Determine filter for main posts response
    let filter = {};
    if (status === "published") filter.isDraft = false;
    else if (status === "draft") filter.isDraft = true;

    // Fetch paginated posts
    const posts = await BlogPost.find(filter)
      .populate("author", "name profileImageUrl")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count totals for pagination and tab counts
    const [totalCount, allCount, publishedCount, draftCount] = await Promise.all([
      BlogPost.countDocuments(filter), // for pagination of current tab
      BlogPost.countDocuments(),
      BlogPost.countDocuments({ isDraft: false }),
      BlogPost.countDocuments({ isDraft: true }),
    ]);

    res.json({
      posts,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      counts: {
        all: allCount,
        published: publishedCount,
        draft: draftCount,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get a single blog post by slug
// @route   GET /api/posts/:slug
// @access  Public
const getPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug }).populate(
      "author",
      "name profileImageUrl"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get posts by tag
// @route   GET /api/posts/tag/:tag
// @access  Public
const getPostsByTag = async (req, res) => {
  try {
    const posts = await BlogPost.find({
      tags: req.params.tag,
      isDraft: false,
    }).populate("author", "name profileImageUrl");
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Search posts by title or content
// @route   GET /api/posts/search?q=keyword
// @access  Public
const searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    const posts = await BlogPost.find({
      isDraft: false,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    }).populate("author", "name profileImageUrl");
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Increment post view count
// @route   PUT /api/posts/:id/view
// @access  Public
const incrementView = async (req, res) => {
  try {
    await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: "View count incremented" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Public
const likePost = async (req, res) => {
  try {
    await BlogPost.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } });
    res.json({ message: "Like added" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get top trending posts
// @route   GET /api/posts/trending
// @access  Private
const getTopPosts = async (req, res) => {
  try {
    // Top performing posts
    const posts = await BlogPost.find({ isDraft: false })
      .sort({ views: -1, likes: -1 })
      .limit(5);

    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server Error", error: err.message });
  }
};

module.exports = {
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
};
