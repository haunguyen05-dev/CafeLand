import { useState } from "react";
import "../css/Register.css";

export function Register() {
    // Quản lý state cho các ô input
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    
    // State hiển thị trạng thái tải hoặc lỗi
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState("user");

    const onRegister = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn reload trang

        // Validate cơ bản phía Client (tương tự backend check)
        if (!name || !email || !password) {
            alert("Vui lòng điền đầy đủ tên, email và mật khẩu!");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name,
                email,
                password,
                phone,
                role
            };

            const url = "http://localhost:3000/register"; 
            
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.status === 200) {
                alert(result.message || "Đăng ký thành công!");
                 window.location.href = "/" 
            } else {
                // Hiển thị lỗi từ backend (ví dụ: "Email đã tồn tại")
                alert(result.message || "Đăng ký thất bại");
            }

        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
            alert("Đã xảy ra lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2>ĐĂNG KÝ TÀI KHOẢN</h2>
                
                <form className="register-form" onSubmit={onRegister}>
                    <div className="form-group">
                        <label>Họ và tên (*)</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập họ tên của bạn"
                        />
                    </div>

                    <div className="form-group">
                        <label>Email (*)</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@gmail.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu (*)</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input 
                            type="text" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại (tùy chọn)"
                        />
                    </div>

                    <div>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="store">Store</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="register-btn" 
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                    </button>
                </form>
            </div>
        </div>
    );
}