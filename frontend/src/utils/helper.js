export const getInitials = (title) => {
  if (!title) return "";

  const words = title.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0];
  }

  return initials.toUpperCase();
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getToastMessagesByType = (type) => {
  switch (type) {
    case "edit":
      return "Bài đăng trên blog được cập nhật thành công!";
    case "draft":
      return "Bài đăng trên blog đã được lưu thành bản nháp thành công!";
    case "published":
      return "Bài đăng trên blog được xuất bản thành công!";

    default:
      return "Bài đăng trên blog được xuất bản thành công!";
  }
};

export const sanitizeMarkdown = (content) => {
  const markdownBlockRegex = /^```(?:markdown)?\n([\s\S]*?)\n```$/;
  const match = content.match(markdownBlockRegex);
  return match ? match[1] : content;
};
