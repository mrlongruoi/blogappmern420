import moment from "moment";
import { useContext, useEffect, useState } from "react";
import {
  LuChartLine,
  LuCheckCheck,
  LuGalleryVerticalEnd,
  LuHeart,
} from "react-icons/lu";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { UserContext } from "../../context/contextValue";
import TopPostCard from "../../components/Cards/TopPostCard";
import TagInsights from "../../components/Cards/TagInsights";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import RecentCommentsList from "../../components/Cards/RecentCommentsList";
import DashboardSummaryCard from "../../components/Cards/DashboardSummaryCard";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  // navigate not used in this component

  const [dashboardData, setDashboardData] = useState(null);
  const [maxViews, setMaxViews] = useState(0);

  const getDashboardData = async () => {
    try {
      const { data } = await axiosInstance.get(
        API_PATHS.DASHBOARD.GET_DASHBOARD_DATA
      );
      if (data) {
        setDashboardData(data);

        const topPosts = data?.topPosts || [];
        const totalViews = Math.max(...topPosts.map((p) => p.views), 1);
        setMaxViews(totalViews);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    getDashboardData();

    return () => {};
  }, []);
  return (
    <DashboardLayout activeMenu="Dashboard">
      {dashboardData && (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50 mt-5">
            <div>
              <div className="col-span-3">
                <h2 className="text-xl md:text-2xl font-medium">
                  Chúc một ngày tốt lành {user.name}
                </h2>
                <p className="text-xs md:text-[13px] font-medium text-gray-400 mt-1.5">
                  {moment().format("dddd MMM YYYY")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mt-5">
              <DashboardSummaryCard
                icon={<LuGalleryVerticalEnd />}
                label="Tổng số bài viết"
                value={dashboardData?.stats?.totalPosts || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuCheckCheck />}
                label="Đã xuất bản"
                value={dashboardData?.stats?.published || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuChartLine />}
                label="Tổng số lượt xem"
                value={dashboardData?.stats?.totalViews || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />

              <DashboardSummaryCard
                icon={<LuHeart />}
                label="Tổng số lượt thích"
                value={dashboardData?.stats?.totalLikes || 0}
                bgColor="bg-sky-100/60"
                color="text-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 md:my-6">
            <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Thông tin thẻ</h5>
              </div>

              <TagInsights tagUsage={dashboardData?.tagUsage || []} />
            </div>

            <div className="col-span-12 md:col-span-5 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Bài viết hàng đầu</h5>
              </div>

              {dashboardData?.topPosts?.slice(0, 3)?.map((post) => (
                <TopPostCard
                  key={post._id}
                  title={post.title}
                  coverImageUrl={post.coverImageUrl}
                  views={post.views}
                  likes={post.likes}
                  maxViews={maxViews}
                />
              ))}
            </div>

            <div className="col-span-12 bg-white p-6 rounded-2xl shadow-md shadow-gray-100 border border-gray-200/50">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Bình luận gần đây</h5>
              </div>

              <RecentCommentsList
                comments={dashboardData.recentComments || []}
              />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
