
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../../css/admin.css";

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin/stores";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.username === "admin" && form.password === "123456") {
      localStorage.setItem("admin", JSON.stringify({ user: "admin" }));
      navigate(from, { replace: true });
    } else {
      setError("Sai tài khoản hoặc mật khẩu");
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Đăng nhập Admin</h2>

        {error && <p className="error-text">{error}</p>}

        <label>
          Tên đăng nhập
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            autoFocus
          />
        </label>

        <label>
          Mật khẩu
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn-submit">Đăng nhập</button>
      </form>
    </div>
  );
}
