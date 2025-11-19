import { Navigate } from "react-router-dom";
import type { User } from "../../../interfaces/User";

interface SellerRouteProps {
  children: React.ReactNode;
}

export function SellerRoute({ children }: SellerRouteProps) {
  const storedUser = localStorage.getItem("user");
  let user: User | null = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Lỗi parse user:", error);
    }
  }

  // Kiểm tra user đã đăng nhập và có role = seller
  if (!user || user.role !== "seller") {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
