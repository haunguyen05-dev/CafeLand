import { useState, useEffect } from "react";
import { Link, BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

import type { User } from "./interfaces/User"; 

import { IoCart, IoPersonCircleOutline, IoLogOutOutline } from "react-icons/io5";

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

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
    <Router>
      <div>
        <div className="logo-con flex-between">
          <Link to={"/"}>
            <Logo />
          </Link>
          <div className="header-btn flex-center">
            <div className="auth-links flex-center">
              {user ? (
                <div className="user-info flex-center" style={{ gap: "10px", color: "white", marginRight: "15px" }}>
                   <IoPersonCircleOutline size={24} />
                   <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                     {/* 3. Dùng user?.name để an toàn (nếu lỗi thì hiện chữ "Bạn") */}
                     Chào, {user?.name || "Bạn"}
                   </span>
                   <button 
                      onClick={handleLogout} 
                      title="Đăng xuất"
                      style={{ 
                        background: "transparent", 
                        border: "none", 
                        color: "#ff6b6b",
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

            <Link to={"/cart"}>
              <div className="header-ic flex-center" style={{ gap: "15px" }}>
                <IoCart />
                <span className="flex-center">GIỎ HÀNG</span>
              </div>
            </Link>
          </div>
        </div>
        <div className="header flex-center">
          <Searchbar onSearch={setSearchTerm} />
        </div>
        <Category
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;