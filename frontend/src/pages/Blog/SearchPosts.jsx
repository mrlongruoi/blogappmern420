import { useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import { useEffect, useState } from "react";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import BlogPostSummaryCard from "./components/BlogPostSummaryCard";
import BlogLayout from "../../components/layouts/BlogLayout/BlogLayout";

const SearchPosts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");
  const [searchResults, setSearchResults] = useState([]);

  // handle post click
  const handleClick = (post) => {
    navigate(`/${post.slug}`);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(API_PATHS.POSTS.SEARCH, {
          params: { q: query },
        });
        if (!mounted) return;
        if (data) setSearchResults(data || []);
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <BlogLayout>
      <div>
        <h3 className="text-lg font-medium">
          Đang hiển thị kết quả tìm kiếm cho "
          <span className="font-semibold">{query}</span>"
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {searchResults.length > 0 &&
            searchResults.map((item) => (
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
    </BlogLayout>
  );
};

export default SearchPosts;
