import { NavLink, Outlet } from "react-router-dom";
import "../../../css/admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-page">
      <h1>Admin sàn CafeLand</h1>

      {/* Tabs */}
      <div className="admin-tabs">
        <NavLink
          to="/admin/stores"
          className={({ isActive }) =>
            "admin-tab" + (isActive ? " admin-tab--active" : "")
          }
        >
          Cửa hàng
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            "admin-tab" + (isActive ? " admin-tab--active" : "")
          }
        >
          Người dùng
        </NavLink>

        <NavLink
          to="/admin/vouchers"
          className={({ isActive }) =>
            "admin-tab" + (isActive ? " admin-tab--active" : "")
          }
        >
          Voucher
        </NavLink>
      </div>

      {/* Khung nội dung */}
      <div className="admin-card">
        <Outlet />
      </div>
    </div>
  );
}
