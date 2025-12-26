import { useRouter } from "next/navigation";
import { useLoginMutation, useLogoutMutation } from "@/lib/services/authApi";
import { useState, useEffect } from "react";

export const useAuth = () => {
  const router = useRouter();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login({ email, password }).unwrap();
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      // Even if the server request fails, clear local storage
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  const getUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  return {
    handleLogin,
    handleLogout,
    isLoggingIn,
    isLoggingOut,
    isAuthenticated,
    user: getUser(),
  };
};
