import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { useEffect, useState } from "react";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import BlogPostSummaryCard from "./components/BlogPostSummaryCard";
import TrendingPostsSection from "./components/TrendingPostsSection";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";

const PostByTags = () => {
  const { tagName } = useParams();
  const navigate = useNavigate();
  const [blogPostList, setBlogPostList] = useState([]);

  // handle post click
  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };

  useEffect(() => {
    const getPostsByTag = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.POSTS.GET_BY_TAG(tagName)
        );

        setBlogPostList(response.data?.length > 0 ? response.data : []);
      } catch (error) {
        console.error("Lỗi tìm nạp dữ liệu:", error);
      }
    };

    getPostsByTag();
    return () => {};
  }, [tagName]);

  return (
    <BlogLayout>
      <div>
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-center bg-linear-to-r from-sky-50 via-teal-50 to-cyan-100 h-32 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-sky-900">
                  # {tagName}
                </h3>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  Đang hiển thị {blogPostList.length} bài viết được gắn thẻ với
                  #{tagName}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {blogPostList.length > 0 &&
                blogPostList.map((item) => (
                  <BlogPostSummaryCard
                    key={item._id}
                    title={item.title}
                    coverImageUrl={item.coverImageUrl}
                    description={item.content}
                    tags={item.tags}
                    updatedOn={
                      item.updatedAt
                        ? moment(item.updatedAt).format("Do MMM YYYY")
                        : "-"
                    }
                    authorName={item.author.name}
                    authProfileImg={item.author.profileImageUrl}
                    onClick={() => handleClick(item)}
                  />
                ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <TrendingPostsSection />
          </div>
        </div>
      </div>
    </BlogLayout>
  );
};

export default PostByTags;
