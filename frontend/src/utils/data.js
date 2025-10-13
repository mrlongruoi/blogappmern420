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
    label: "Kỹ Thuật Nhiếp Ảnh",
    icon: LuTag,
    path: "/tag/ky-thuat-nhiep-anh",
  },
  {
    id: "03",
    label: "Nhiếp Ảnh Chân Dung",
    icon: LuTag,
    path: "/tag/nhiep-anh-chan-dung",
  },
  {
    id: "04",
    label: "Nhiếp Ảnh Phong Cảnh",
    icon: LuTag,
    path: "/tag/nhiep-anh-phong-canh",
  },
  {
    id: "05",
    label: "Ánh Sáng & Thiết Bị Studio",
    icon: LuTag,
    path: "/tag/anh-sang-studio",
  },
  {
    id: "06",
    label: "Hậu Kỳ & Workflow",
    icon: LuTag,
    path: "/tag/hau-ky-workflow",
  },
  {
    id: "07",
    label: "Đánh Giá Thiết Bị",
    icon: LuTag,
    path: "/tag/danh-gia-thiet-bi",
  },
  {
    id: "08",
    label: "Kinh Doanh Nhiếp Ảnh",
    icon: LuTag,
    path: "/tag/kinh-doanh-nhiep-anh",
  },
];
