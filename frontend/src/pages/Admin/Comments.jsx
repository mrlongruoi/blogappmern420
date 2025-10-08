import { useNavigate } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import CommentInfoCard from "../../components/Cards/CommentInfoCard";
import DeleteAlertContent from "../../components/DeleteAlertContent";
import DashboardLayout from "../../components/layouts/DashboardLayout";

const Comments = () => {
  const [comments, setComments] = useState([]);

  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    open: false,
    data: null,
  });

  const _navigate = useNavigate();

  // get all commets
  const getAllComments = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.COMMENTS.GET_ALL);
      setComments(response.data?.length > 0 ? response.data : []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  // delete comment
  const deleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(API_PATHS.COMMENTS.DELETE(commentId));

      toast.success("Bình luận đã được xóa thành công");
      setOpenDeleteAlert({
        open: false,
        data: null,
      });
      getAllComments();
    } catch (error) {
      console.error("Lỗi khi xóa bài đăng trên blog:", error);
    }
  };

  useEffect(() => {
    getAllComments();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Comments">
      <div className="w-auto sm:max-w-[900px] mx-auto">
        <h2 className="text-2xl font-semibold mt-5 mb-5">Comments</h2>

        {comments.map((comment) => (
          <CommentInfoCard
            key={comment._id}
            commentId={comment._id || null}
            authorName={comment.author.name}
            authorPhoto={comment.author.profileImageUrl}
            content={comment.content}
            updatedOn={
              comment.updatedAt
                ? moment(comment.updatedAt).format("Do MMM YYYY")
                : "-"
            }
            post={comment.post}
            replies={comment.replies || []}
            getAllComments={getAllComments}
            onDelete={(commentId) =>
              setOpenDeleteAlert({ open: true, data: commentId || comment._id })
            }
          />
        ))}
      </div>

      <Modal
        isOpen={openDeleteAlert?.open}
        onClose={() => {
          setOpenDeleteAlert({ open: false, data: null });
        }}
        title="Xóa cảnh báo"
      >
        <div className="w-[30vw]">
          <DeleteAlertContent
            content="Bạn có chắc chắn muốn xóa bình luận này không?"
            onDelete={() => deleteComment(openDeleteAlert.data)}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Comments;
