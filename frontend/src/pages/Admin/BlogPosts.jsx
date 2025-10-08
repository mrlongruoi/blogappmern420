import { useNavigate } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import { LuGalleryVerticalEnd, LuLoaderCircle, LuPlus } from "react-icons/lu";
import Tabs from "../../components/Tabs";
import Modal from "../../components/Modal";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import BlogPostSummaryCard from "../../components/Cards/BlogPostSummaryCard";

const BlogPosts = () => {
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [blogPostList, setBlogPostList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  // fetch all blog posts
  const getAllPosts = useCallback(
    async (pageNumber = 1) => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(API_PATHS.POSTS.GET_ALL, {
          params: {
            status: filterStatus.toLowerCase(),
            page: pageNumber,
          },
        });

        const { posts, totalPages, counts } = response.data;

        setBlogPostList((prevPosts) =>
          pageNumber === 1 ? posts : [...prevPosts, ...posts]
        );
        setTotalPages(totalPages);
        setPage(pageNumber);

        // Map statusSummary data with fixed labels and order
        const statusSummary = counts || {};

        const statusArray = [
          { label: "Tất cả", count: statusSummary.all || 0 },
          { label: "Đã đăng", count: statusSummary.published || 0 },
          { label: "Bản nháp", count: statusSummary.draft || 0 },
        ];

        setTabs(statusArray);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filterStatus]
  );

  // delete blog post
  const deletePost = async (postId) => {
    try {
      await axiosInstance.delete(API_PATHS.POSTS.DELETE(postId));

      toast.success("Bài viết đã được xóa thành công");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      getAllPosts();
    } catch (error) {
      console.error("Lỗi khi xóa bài viết:", error);
    }
  };

  // Load more posts
  const handleLoadMore = () => {
    if (page < totalPages) {
      getAllPosts(page + 1);
    }
  };

  useEffect(() => {
    getAllPosts(1);
    return () => {};
  }, [getAllPosts]);

  return (
    <DashboardLayout activeMenu="Blog Posts">
      <div className="w-auto sm:max-w-[900px] mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mt-5 mb-5">
            Bài đăng trên blog
          </h2>

          <button
            className="btn-small"
            onClick={() => navigate("/admin/create")}
          >
            <LuPlus className="text-[18px]" /> Tạo bài đăng
          </button>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={filterStatus}
          setActiveTab={setFilterStatus}
        />

        <div className="mt-5">
          {blogPostList.map((post) => (
            <BlogPostSummaryCard
              key={post._id}
              title={post.title}
              imgUrl={post.coverImageUrl}
              updatedOn={
                post.updatedAt
                  ? moment(post.updatedAt).format("Do MMM YYYY")
                  : "-"
              }
              tags={post.tags}
              likes={post.likes}
              views={post.views}
              onClick={() => navigate(`/admin/edit/${post.slug}`)}
              onDelete={() =>
                setOpenDeleteAlert({ open: true, data: post._id })
              }
            />
          ))}

          {page < totalPages && (
            <div className="flex items-center justify-center mb-8">
              <button
                className="flex items-center gap-3 text-sm text-white font-medium bg-black px-7 py-2.5 rounded-full text-nowrap hover:scale-105 transition-all cursor-pointer"
                disabled={isLoading}
                onClick={handleLoadMore}
              >
                {isLoading ? (
                  <LuLoaderCircle className="animate-spin text-[15px]" />
                ) : (
                  <LuGalleryVerticalEnd className="text-lg" />
                )}{" "}
                {isLoading ? "Đang tải..." : "Tải thêm"}
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null });
        }}
        title="Xác nhận xóa"
      >
        <div className="w-[70vw] md:w-[30vw]">
          <DeleteAlertContent
            content="Bạn có chắc chắn muốn xóa bài viết này không?"
            onDelete={() => deletePost(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default BlogPosts;
