import { renderHook, act, waitFor } from "@testing-library/react";
import { useAuth } from "@/hooks/useAuth";
import { useLoginMutation, useLogoutMutation } from "@/lib/services/authApi";
import { useRouter } from "next/navigation";

jest.mock("@/lib/services/authApi");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("useAuth", () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useLoginMutation as jest.Mock).mockReturnValue([
      mockLogin,
      { isLoading: false },
    ]);
    (useLogoutMutation as jest.Mock).mockReturnValue([
      mockLogout,
      { isLoading: false },
    ]);
  });

  describe("handleLogin", () => {
    it("should login successfully and store token", async () => {
      const mockResponse = {
        accessToken: "test-token",
        user: { id: 1, email: "test@example.com", name: "Test User" },
      };

      mockLogin.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue(mockResponse),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.handleLogin("test@example.com", "password123");
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockLocalStorage.getItem("accessToken")).toBe("test-token");
      expect(mockLocalStorage.getItem("user")).toBe(JSON.stringify(mockResponse.user));
    });

    it("should throw error on failed login", async () => {
      const mockError = new Error("Invalid credentials");
      mockLogin.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(mockError),
      });

      const { result } = renderHook(() => useAuth());

      await expect(
        result.current.handleLogin("test@example.com", "wrongpassword")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("handleLogout", () => {
    it("should logout and clear storage", async () => {
      mockLocalStorage.setItem("accessToken", "test-token");
      mockLocalStorage.setItem("user", JSON.stringify({ id: 1, email: "test@example.com" }));

      mockLogout.mockReturnValue({
        unwrap: jest.fn().mockResolvedValue({ message: "Logged out" }),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.handleLogout();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockLocalStorage.getItem("accessToken")).toBeNull();
      expect(mockLocalStorage.getItem("user")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("should clear storage even if logout request fails", async () => {
      mockLocalStorage.setItem("accessToken", "test-token");

      mockLogout.mockReturnValue({
        unwrap: jest.fn().mockRejectedValue(new Error("Network error")),
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.handleLogout();
      });

      expect(mockLocalStorage.getItem("accessToken")).toBeNull();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when token exists", () => {
      mockLocalStorage.setItem("accessToken", "test-token");

      const { result } = renderHook(() => useAuth());

      waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it("should return false when token does not exist", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("getUser", () => {
    it("should return user from localStorage", () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      mockLocalStorage.setItem("user", JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
    });

    it("should return null when no user in localStorage", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
    });
  });
});
