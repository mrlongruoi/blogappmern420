import { useState, useEffect } from "react";
import { API_PATHS } from "../utils/apiPaths";
import axiosInstance from "../utils/axiosInstance";
import { UserContext } from "./contextValue";

// Re-export the context so older imports that reference
// './context/userContext' and expect a named `UserContext` will still work.
export { UserContext };

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAuthForm, setOpenAuthForm] = useState(false);

  // Use token as the dependency. We don't want to re-run when `user` changes
  // (that would create a loop). Fast and safe check: if there's a token
  // in localStorage, attempt to fetch profile once on mount or when token changes.
  // Intentionally run on mount and whenever `user` changes. We return early
  // if `user` exists so the effect only fetches profile when there's a token
  // and no user in state.
  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem("token");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        if (!mounted) return;
        setUser(response.data);
      } catch (error) {
        console.error("Người dùng không được xác thực", error);
        clearUser();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [user]);

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token); // Save token
    setLoading(false);
  };

  const clearUser = () => {
    // Remove user and token. Do not reference other modules/state here.
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
        updateUser,
        clearUser,
        openAuthForm,
        setOpenAuthForm,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
