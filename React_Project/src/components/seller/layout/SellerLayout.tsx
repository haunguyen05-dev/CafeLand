import { useState } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import { IoHome, IoLogOutOutline, IoMenu, IoClose } from "react-icons/io5";

import "../../../css/seller.css";
import SellerStorePage from "../pages/SellerStorePage";
import StoreDetail from "../pages/StoreDetail";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
};

export default function SellerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="seller-container">
      {/* Header */}
      <header className="seller-header">
        <div className="seller-header-content flex-between">
          <div className="seller-logo flex-center">
            <Link to="/seller">
              <h1>CafeLand Seller</h1>
            </Link>
          </div>
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
          </button>
          <div className="seller-user-info flex-center">
            <span>{user?.name || "Seller"}</span>
            <button 
              onClick={handleLogout}
              className="logout-btn"
              title="Đăng xuất"
            >
              <IoLogOutOutline size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="seller-content flex">
        {/* Sidebar */}
        <aside className={`seller-sidebar ${sidebarOpen ? "open" : ""}`}>
          <nav className="seller-nav">
            <Link 
              to="/seller" 
              className={`nav-link ${isActive("/seller") ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <IoHome size={20} />
              <span>Quản lí Store</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="seller-main">
          <Routes>
            <Route index element={<SellerStorePage />} />
            <Route path="store/:id" element={<StoreDetail />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
