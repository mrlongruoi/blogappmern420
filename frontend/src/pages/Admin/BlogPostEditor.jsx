import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LuLoaderCircle,
  LuSave,
  LuSend,
  LuSparkles,
  LuTrash2,
} from "react-icons/lu";
import { useEffect, useState, useCallback } from "react";
import Modal from "../../components/Modal";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import axiosInstance from "../../utils/axiosInstance";
import TagInput from "../../components/Inputs/TagInput";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { suggestTagsForPost } from "../../constants/aiTopicsHelper";
import { mapTagsToNav } from "../../constants/tagMapper";
import { getToastMessagesByType } from "../../utils/helper";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import GenerateBlogPostForm from "./components/GenerateBlogPostForm";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import BlogPostIdeaCard from "../../components/Cards/BlogPostIdeaCard";
import CoverImageSelector from "../../components/Inputs/CoverImageSelector";

const BlogPostEditor = ({ isEdit }) => {
  const navigate = useNavigate();
  const { postSlug = "" } = useParams();

  const [postData, setPostData] = useState({
    id: "",
    title: "",
    content: "",
    coverImageUrl: "",
    coverPreview: "",
    tags: "",
    isDraft: "",
    generatedByAI: false,
  });

  const [postIdeas, setPostIdeas] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [openBlogPostGenForm, setOpenBlogPostGenForm] = useState({
    open: false,
    data: null,
  });
  const [ideaLoading, setIdeaLoading] = useState(false);

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setPostData((prevData) => ({ ...prevData, [key]: value }));
  };

  // Handle Blog Post Publish
  const handlePublish = async (isDraft) => {
    let coverImageUrl = "";

    if (!postData.title.trim()) {
      setError("Vui lòng nhập tiêu đề.");
      return;
    }
    if (!postData.content.trim()) {
      setError("Vui lòng nhập một số nội dung.");
      return;
    }

    if (!isDraft) {
      if (!isEdit && !postData.coverImageUrl) {
        setError("Vui lòng chọn ảnh bìa.");
        return;
      }
      if (isEdit && !postData.coverImageUrl && !postData.coverPreview) {
        setError("Vui lòng chọn ảnh bìa.");
        return;
      }
      if (!postData.tags.length) {
        setError("Vui lòng thêm tag cho bài viết.");
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      // Check if a new image was uploaded (File type)
      if (postData.coverImageUrl instanceof File) {
        const imgUploadRes = await uploadImage(postData.coverImageUrl);
        coverImageUrl = imgUploadRes.imageUrl || "";
      } else {
        coverImageUrl = postData.coverPreview;
      }

      const reqPayload = {
        title: postData.title,
        content: postData.content,
        coverImageUrl,
        tags: postData.tags,
        isDraft: isDraft ? true : false,
        generatedByAI: true,
      };

      const response = isEdit
        ? await axiosInstance.put(
            API_PATHS.POSTS.UPDATE(postData.id),
            reqPayload
          )
        : await axiosInstance.post(API_PATHS.POSTS.CREATE, reqPayload);

      if (response.data) {
        toast.success(
          getToastMessagesByType(
            isDraft ? "draft" : isEdit ? "edit" : "published"
          )
        );
        navigate("/admin/posts");
      }
    } catch (error) {
      setError("Không thể đăng bài viết trên blog. Vui lòng thử lại.");
      console.error("Lỗi xuất bản bài đăng trên blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchPostDetailsBySlug = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.POSTS.GET_BY_SLUG(postSlug)
        );

        if (response.data) {
          const data = response.data;

          setPostData((prevState) => ({
            ...prevState,
            id: data._id,
            title: data.title,
            content: data.content,
            coverPreview: data.coverImageUrl,
            tags: data.tags,
            isDraft: data.isDraft,
            generatedByAI: data.generatedByAI,
          }));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (isEdit) {
      fetchPostDetailsBySlug();
    }
    // depend on isEdit and postSlug so effect runs when those change
  }, [isEdit, postSlug]);

  // Generate ideas when creating a new post or when title/content change
  useEffect(() => {
    if (isEdit) return; // only for new posts
    // debounce: only call after user has typed a bit; quick heuristic with timeout
    const id = setTimeout(() => {
      fetchIdeas();
    }, 600);

    return () => clearTimeout(id);
  }, [isEdit, postData.title, postData.content]);

  // fetchIdeas is exposed so the UI can request a fresh set of ideas on demand
  const fetchIdeas = useCallback(async () => {
    if (isEdit) return;
    setIdeaLoading(true);
    try {
      const suggested = suggestTagsForPost(postData.title, postData.content, 5);
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_BLOG_POST_IDEAS,
        {
          topics: suggested.join(", "),
        }
      );
      const generatedIdeas = aiResponse.data;

      if (generatedIdeas?.length > 0) {
        setPostIdeas(generatedIdeas);
      }
    } catch (error) {
      console.log("Có gì đó không ổn. Vui lòng thử lại.", error);
    } finally {
      setIdeaLoading(false);
    }
  }, [isEdit, postData.title, postData.content]);

  // Delete Blog Post
  const deletePost = async () => {
    try {
      await axiosInstance.delete(API_PATHS.POSTS.DELETE(postData.id));

      toast.success("Xóa bài đăng trên blog thành công");
      setOpenDeleteAlert(false);
      navigate("/admin/posts");
    } catch (error) {
      console.error("Lỗi xóa bài đăng trên blog:", error);
    }
  };

  return (
    <DashboardLayout activeMenu="Blog Posts">
      <div className="my-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-4">
          <div className="form-card p-6 col-span-12 md:col-span-8">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-medium">
                {!isEdit ? "Thêm Bài Đăng Mới" : "Chỉnh Sửa Bài Đăng"}
              </h2>

              <div className="flex items-center gap-3">
                {isEdit && (
                  <button
                    className="flex items-center gap-2.5 text-[13px] font-medium text-rose-500 bg-rose-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-rose-50 hover:border-rose-300 cursor-pointer hover:scale-[1.02] transition-all"
                    disabled={loading}
                    onClick={() => setOpenDeleteAlert(true)}
                  >
                    <LuTrash2 className="text-sm" />{" "}
                    <span className="hidden md:block">Xóa bỏ</span>
                  </button>
                )}

                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-sky-500 bg-sky-50/60 rounded px-1.5 md:px-3 py-1 md:py-[3px] border border-sky-100 hover:border-sky-400 cursor-pointer hover:scale-[1.02] transition-all"
                  disabled={loading}
                  onClick={() => handlePublish(true)}
                >
                  <LuSave className="text-sm" />{" "}
                  <span className="hidden md:block">Lưu dưới dạng nháp</span>
                </button>

                <button
                  className="flex items-center gap-2.5 text-[13px] font-medium text-sky-600 hover:text-white hover:bg-linear-to-r hover:from-sky-500 hover:to-indigo-500 rounded px-3 py-[3px] border border-sky-500 hover:border-sky-50 cursor-pointer transition-all"
                  disabled={loading}
                  onClick={() => handlePublish(false)}
                >
                  {loading ? (
                    <LuLoaderCircle className="animate-spin text-[15px]" />
                  ) : (
                    <LuSend className="text-sm" />
                  )}{" "}
                  Xuất bản
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-600">
                Tiêu đề bài đăng
              </label>

              <input
                placeholder="Ví dụ: Cách xây dựng ứng dụng MERN, v.v."
                className="form-input"
                value={postData.title}
                onChange={({ target }) =>
                  handleValueChange("title", target.value)
                }
              />
            </div>

            <div className="mt-4">
              <CoverImageSelector
                image={postData.coverImageUrl}
                setImage={(value) => handleValueChange("coverImageUrl", value)}
                preview={postData.coverPreview}
                setPreview={(value) => handleValueChange("coverPreview", value)}
              />
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">
                Nội dung
              </label>

              <div data-color-mode="light" className="mt-3">
                <MDEditor
                  value={postData.content}
                  onChange={(data) => {
                    handleValueChange("content", data);
                  }}
                  commands={[
                    commands.bold,
                    commands.italic,
                    commands.strikethrough,
                    commands.hr,
                    commands.title,
                    commands.divider,
                    commands.link,
                    commands.code,
                    commands.image,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.checkedListCommand,
                  ]}
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-slate-600">Thẻ</label>

              <TagInput
                tags={postData?.tags || []}
                setTags={(data) => {
                  handleValueChange("tags", data);
                }}
              />
            </div>
          </div>

          {!isEdit && (
            <div className="form-card col-span-12 md:col-span-4 p-0">
              <div className="flex items-center justify-between px-6 pt-6">
                <h4 className="text-sm md:text-base font-medium inline-flex items-center gap-2">
                  <span className="text-sky-600">
                    <LuSparkles />
                  </span>
                  Ý tưởng cho bài viết tiếp theo của bạn
                </h4>

                <div className="flex gap-2">
                  <button
                    className="bg-linear-to-r from-sky-500 to-cyan-400 text-[13px] font-semibold text-white px-3 py-1 rounded hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-sky-200 min-w-[120px] flex items-center justify-center"
                    onClick={() =>
                      setOpenBlogPostGenForm({ open: true, data: null })
                    }
                  >
                    <span className="select-none">Tạo mới</span>
                  </button>

                  <button
                    className="bg-linear-to-r from-sky-500 to-cyan-400 text-[13px] font-semibold text-white px-3 py-1 rounded hover:bg-black hover:text-white transition-colors cursor-pointer hover:shadow-2xl hover:shadow-sky-200 min-w-[160px] flex items-center justify-center"
                    onClick={() => fetchIdeas()}
                    disabled={ideaLoading}
                    title="Tải ý tưởng mới"
                  >
                    <span className="flex items-center gap-2">
                      <LuLoaderCircle
                        className={`${ideaLoading ? "animate-spin text-[12px]" : "opacity-0 text-[12px]"}`}
                      />
                      <span className="select-none">Tải ý tưởng mới</span>
                    </span>
                  </button>
                </div>
              </div>

              <div>
                {ideaLoading ? (
                  <div className="p-5">
                    <SkeletonLoader />
                  </div>
                ) : (
                  postIdeas.map((idea, index) => (
                    <BlogPostIdeaCard
                      key={`idea_${index}`}
                      title={idea.title || ""}
                      description={idea.description || ""}
                      tags={idea.tags || []}
                      tone={idea.tone || "casual"}
                      onSelect={() =>
                        setOpenBlogPostGenForm({ open: true, data: idea })
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={openBlogPostGenForm?.open}
        onClose={() => {
          setOpenBlogPostGenForm({ open: false, data: null });
        }}
        hideHeader
      >
        <GenerateBlogPostForm
          contentParams={openBlogPostGenForm?.data || null}
          setPostContent={(title, content) => {
            const postInfo = openBlogPostGenForm?.data || null;
              // map incoming idea tags to navbar slugs (e.g. 'dev-ops') when possible
              const incomingTags = postInfo?.tags || [];
              const mapped = mapTagsToNav(incomingTags).map((s) => `${s}`);
              setPostData((prevState) => ({
                ...prevState,
                title: title || prevState.title,
                content: content,
                tags: mapped.length ? mapped : postInfo?.tags || prevState.tags,
                generatedByAI: true,
              }));
          }}
          handleCloseForm={() => {
            setOpenBlogPostGenForm({ open: false, data: null });
          }}
        />
      </Modal>

      <Modal
        isOpen={openDeleteAlert}
        onClose={() => {
          setOpenDeleteAlert(false);
        }}
        title="Cảnh báo xóa"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Bạn có chắc chắn muốn xóa bài viết này không?"
            onDelete={() => deletePost()}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default BlogPostEditor;
