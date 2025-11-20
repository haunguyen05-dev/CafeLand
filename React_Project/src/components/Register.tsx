import { useState } from "react";
import { Link } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
import "../css/Register.css";

export function Register() {
    // Quản lý state cho các ô input
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("user");
    
    // State hiển thị trạng thái tải hoặc lỗi
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

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
                alert(result.message || "Đăng ký thất bại");
            }

        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
            alert("Đã xảy ra lỗi kết nối đến máy chủ");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        window.location.href = "/";
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="register-overlay">
            <div className="register-modal">
                <button className="close-btn" onClick={handleClose}>
                    <IoCloseOutline size={24} />
                </button>

                <h2 className="register-title">ĐĂNG KÝ TÀI KHOẢN</h2>
                
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

                    <label>Số điện thoại</label>
                    <div style={{"marginTop": "5px"}}>
                        <input 
                            type="text" 
                            value={phone}   
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại (tùy chọn)"
                        />
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="seller">Seller</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="register-btn" 
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                    </button>

                    <div className="register-footer">
                        <p>Đã có tài khoản?</p> 
                        <Link to="/login" className="login-link">Đăng nhập ngay</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}