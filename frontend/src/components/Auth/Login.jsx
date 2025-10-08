import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import Input from "../Inputs/Input";
import { API_PATHS } from "../../utils/apiPaths";
import AUTH_IMG from "../../assets/auth-img.jpg";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { UserContext } from "../../context/contextValue";

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { updateUser, setOpenAuthForm } = useContext(UserContext);
  const navigate = useNavigate();

  // Handle Login Form Submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Vui lòng nhập một địa chỉ email hợp lệ.");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setError("");

    //Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
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
    <div className="flex items-center">
      <div className="w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center">
        <h3 className="text-lg font-semibold text-black">
          Chào mừng bạn trở lại
        </h3>
        <p className="text-xs text-slate-700 mt-[2px] mb-6">
          Vui lòng nhập thông tin của bạn để đăng nhập
        </p>

        <form onSubmit={handleLogin}>
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
            placeholder="Tối thiểu 8 ký tự"
            type="password"
          />

          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">
            ĐĂNG NHẬP
          </button>

          <p className="text-[13px] text-slate-800 mt-3">
            Bạn chưa có tài khoản?{" "}
            <button
              className="font-medium text-primary underline cursor-pointer"
              onClick={() => {
                setCurrentPage("signup");
              }}
            >
              Đăng ký
            </button>
          </p>
        </form>
      </div>

      <div className="hidden md:block">
        <img src={AUTH_IMG} alt="Login" className="h-[400px]" />
      </div>
    </div>
  );
};

export default Login;
