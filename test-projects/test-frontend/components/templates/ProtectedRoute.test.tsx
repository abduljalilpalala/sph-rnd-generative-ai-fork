import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/templates/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

jest.mock("@/hooks/useAuth");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("ProtectedRoute", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it("should render children when authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to login when not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("should show loading state when not authenticated", () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
