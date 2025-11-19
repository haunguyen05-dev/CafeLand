// src/admin/guard/AdminRoute.tsx
import { Navigate, useLocation } from "react-router-dom";

type Props = {
  children: JSX.Element;
};

export function AdminRoute({ children }: Props) {
  const location = useLocation();
  const adminStr = localStorage.getItem("admin");
  const admin = adminStr ? JSON.parse(adminStr) : null;

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
