import { useState } from "react";
import { Link } from "react-router-dom";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5"; 

import "../css/Login.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/login/", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", JSON.stringify(data.token));
        alert("Đăng nhập thành công!");
        window.location.href = "/";
      } else {
        alert(data.message || "Email hoặc mật khẩu không đúng");
      }
    } catch (error) {
      console.error("Lỗi login:", error);
      alert("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">CHÀO MỪNG TRỞ LẠI</h2>
        <p className="login-subtitle">Vui lòng đăng nhập tài khoản của bạn</p>

        <form className="login-form" onSubmit={onLogin}>
          
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="Nhập email của bạn" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <div className="password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <span 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </span>
            </div>
          </div>

          <div className="form-actions">
            <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>
            <a href="#" className="forgot-password">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
          </button>
          
          <div className="login-footer">
            <p>Bạn chưa có tài khoản?</p> 
            <Link to="/register" className="register-link">Đăng ký ngay</Link>
          </div>
        </form>
      </div>
    </div>
  );
}