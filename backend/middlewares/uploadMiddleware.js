// file: middlewares/upload.js (hoặc tên file tương tự)

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cấu hình Cloudinary bằng các biến môi trường
// (Bạn cần thêm các biến này vào Vercel Environment Variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// LƯU LÊN CLOUDINARY -> HOẠT ĐỘNG TRÊN VERCEL
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "blog_uploads", // Tên thư mục trên Cloudinary
    allowed_formats: ["jpeg", "png", "jpg"],
    // Tùy chọn: public_id để đặt tên file (nếu muốn)
    // public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// File filter vẫn có thể giữ lại nếu muốn kiểm tra trước khi upload
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "image/avif",
    "image/apng",
    "image/tiff",
    "image/bmp",
    "image/heic",
    "image/heif",
    "image/jxl",
    "image/svg",
    "image/ico",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Chỉ chấp nhận các định dạng hình ảnh: .jpeg, .jpg, .png, .webp, .gif, .svg, .avif, .apng, .tiff, .bmp, .heic, .heif, .jxl, .ico"
      ),
      false
    );
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;
