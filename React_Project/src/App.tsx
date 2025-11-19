import { useState, useEffect } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import { Category } from "./components/Category";
import { Product } from "./components/Product";
import { DetailProduct } from "./components/DetailProduct";
import { Searchbar } from "./components/Searchbar";
import { Logo } from "./components/Logo";
import { Cart } from "./components/Cart";
import { VnPayReturn } from "./components/VnPayReturn";
import { Register } from "./components/Register";
import { Login } from "./components/Login";

import AdminLayout from "./components/admin/layout/AdminLayout";
import { AdminRoute } from "./components/admin/guard/AdminRoute";
import AdminLoginPage from "./components/admin/pages/AdminLoginPage";
import AdminStoresPage from "./components/admin/pages/AdminStoresPage";
import AdminUsersPage from "./components/admin/pages/AdminUsersPage";
import AdminVouchersPage from "./components/admin/pages/AdminVouchersPage";

import SellerLayout from "./components/seller/layout/SellerLayout";
import { SellerRoute } from "./components/seller/guard/SellerRoute";

import type { User } from "./interfaces/User"; 

import { IoCart, IoPersonCircleOutline, IoLogOutOutline } from "react-icons/io5";

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isSeller = location.pathname.startsWith("/seller");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div>
      <div>
        {!isAdmin && !isSeller && (
          <>
            <div className="logo-con flex-between">
              <Link to={"/"}>
                <Logo />
              </Link>
              <div className="header-btn flex-center">
                <Link to={"/cart"}>
                  <div className="header-ic flex-center" style={{ gap: "15px" }}>
                    <IoCart />
                    <span className="flex-center">GIỎ HÀNG</span>
                  </div>
                </Link>

                <div className="auth-links flex-center">
                  {user ? (
                    <div className="user-info flex-center" style={{ gap: "10px", color: "white" }}>
                      <IoPersonCircleOutline size={24} />
                      <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                        {user?.name || "Bạn"}
                      </span>
                      {user?.role === "seller" && (
                        <>
                          <span className="divider">|</span>
                          <Link to="/seller" className="header-link" style={{ textDecoration: "underline" }}>
                            Bảng Quản Lí
                          </Link>
                        </>
                      )}
                      <button 
                          onClick={handleLogout} 
                          title="Đăng xuất"
                          style={{ 
                            background: "transparent", 
                            border: "none", 
                            color: "#c23e00ff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center"
                          }}
                      >
                          <IoLogOutOutline size={24} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link to="/register" className="header-link">Đăng ký</Link>
                      <span className="divider">|</span>
                      <Link to="/login" className="header-link">Đăng nhập</Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="header flex-center">
              <Searchbar onSearch={setSearchTerm} />
            </div>
            <Category
              onSelectCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
            />
          </>
        )}
      </div>
      
      <div className="content flex-center">
        <Routes>
          <Route
            path="/"
            element={
              <Product
                selectedCategory={selectedCategory}
                searchTerm={searchTerm}
              />
            }
          />
          <Route path="/product/:_id" element={<DetailProduct />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/vnpay_return" element={<VnPayReturn />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminStoresPage />} />
            <Route path="stores" element={<AdminStoresPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="vouchers" element={<AdminVouchersPage />} />
          </Route>

          <Route
            path="/seller/*"
            element={
              <SellerRoute>
                <SellerLayout />
              </SellerRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;