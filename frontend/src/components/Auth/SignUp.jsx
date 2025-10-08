import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import Input from "../Inputs/Input";
import AUTH_IMG from "../../assets/auth-img.jpg";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { UserContext } from "../../context/contextValue";
import ProfilePhotoSelector from "../Inputs/ProfilePhotoSelector";

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminAccessToken, setAdminAccessToken] = useState("");
  const [error, setError] = useState(null);
  const { updateUser, setOpenAuthForm } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle SignUp Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    if (!fullName) {
      setError("Vui lòng nhập tên đầy đủ.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Vui lòng nhập một địa chỉ email hợp lệ.");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setError("");

    //SignUp API Call
    try {
      // Upload image if present
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminAccessToken,
      });

      const { token, role } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);

        //Redirect based on role
        if (role === "admin") {
          setOpenAuthForm(false);
          navigate("/admin/dashboard");
        }

        navigate("/");
        setOpenAuthForm(false);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }
  };
  return (
    <div className="flex items-center h-auto md:h-[520px]">
      <div className="w-[90vw] md:w-[43vw] p-7 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-black">Tạo tài khoản</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Tham gia cùng chúng tôi hôm nay bằng cách nhập thông tin của bạn bên
          dưới.
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Họ và Tên"
              placeholder="John"
              type="text"
            />

            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Địa chỉ E-mail"
              placeholder="example@mail.com"
              type="text"
            />

            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Mật khẩu"
              placeholder="Mật khẩu phải có ít nhất 8 kí tự"
              type="password"
            />

            <Input
              value={adminAccessToken}
              onChange={({ target }) => setAdminAccessToken(target.value)}
              label="Mã mời quản trị viên"
              placeholder="Mã 6 chữ số"
              type="number"
            />
          </div>

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            ĐĂNG KÝ
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Đã có tài khoản?{" "}
            <button
              className="font-medium text-primary underline cursor-pointer"
              onClick={() => {
                setCurrentPage("login");
              }}
            >
              Đăng nhập
            </button>
          </p>
        </form>
      </div>

      <div className="hidden md:block">
        <img src={AUTH_IMG} alt="Login" className="h-[520px] w-[33vw]" />
      </div>
    </div>
  );
};

export default SignUp;
