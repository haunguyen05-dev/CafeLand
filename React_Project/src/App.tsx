// src/App.tsx
import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import "./App.css";

import { Category } from "./components/Category";
import { Product } from "./components/Product";
import { DetailProduct } from "./components/DetailProduct";
import { Searchbar } from "./components/Searchbar";
import { Logo } from "./components/Logo";
import { Cart } from "./components/Cart";
import { IoCart } from "react-icons/io5";

// ADMIN
import AdminLayout from "./admin/layout/AdminLayout";
import { AdminRoute } from "./admin/guard/AdminRoute";
// trên cùng
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminStoresPage from "./admin/pages/AdminStoresPage";
import AdminUsersPage from "./admin/pages/AdminUsersPage";
import AdminVouchersPage from "./admin/pages/AdminVouchersPage";
// nếu chưa có login thì tạm bỏ AdminLoginPage

function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div>
      {/* HEADER, SEARCH, CATEGORY CHỈ DÙNG CHO USER */}
      {!isAdmin && (
        <>
          {/* Logo + giỏ hàng */}
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
            </div>
          </div>

          {/* Search */}
          <div className="header flex-center">
            <Searchbar onSearch={setSearchTerm} />
          </div>

          {/* Category */}
          <Category
            onSelectCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
          />
        </>
      )}

      {/* NỘI DUNG ROUTES */}
      <div className="content flex-center">
        <Routes>
          {/* USER */}
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

          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ADMIN */}
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
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
