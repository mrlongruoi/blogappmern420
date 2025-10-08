import {
  LuLayoutDashboard,
  LuGalleryVerticalEnd,
  LuMessageSquareQuote,
  LuLayoutTemplate,
  LuTag,
} from "react-icons/lu";

export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Trang tổng quan",
    icon: LuLayoutDashboard,
    path: "/admin/dashboard",
  },

  {
    id: "02",
    label: "Bài đăng Blog",
    icon: LuGalleryVerticalEnd,
    path: "/admin/posts",
  },

  {
    id: "03",
    label: "Bình luận",
    icon: LuMessageSquareQuote,
    path: "/admin/comments",
  },
];

export const BLOG_NAVBAR_DATA = [
  {
    id: "01",
    label: "Trang Chủ",
    icon: LuLayoutTemplate,
    path: "/",
  },
  {
    id: "02",
    label: "Tự Động Hóa & Quản Lý Quy Trình",
    icon: LuTag,
    path: "/tag/auto-workflow",
  },
  {
    id: "03",
    label: "Trí Tuệ Nhân Tạo & Học Máy",
    icon: LuTag,
    path: "/tag/ai-machine-learning",
  },
  {
    id: "04",
    label: "Cơ Sở Dữ Liệu & Lưu Trữ",
    icon: LuTag,
    path: "/tag/database-storage",
  },
  {
    id: "05",
    label: "Phát Triển & Vận Hành",
    icon: LuTag,
    path: "/tag/dev-ops",
  },
  {
    id: "06",
    label: "Phát triển web",
    icon: LuTag,
    path: "/tag/web-development",
  },
  {
    id: "07",
    label: "Phát triển di động",
    icon: LuTag,
    path: "/tag/mobile-development",
  },
  {
    id: "08",
    label: "Phát triển trò chơi",
    icon: LuTag,
    path: "/tag/game-development",
  },
];
