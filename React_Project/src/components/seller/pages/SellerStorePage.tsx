import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoRefresh } from "react-icons/io5";
import type { Store } from "../../../interfaces/Store";
import type { User } from "../../../interfaces/User";

export default function SellerStorePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      // Lấy stores của user hiện tại
      const res = await fetch(`http://localhost:3000/store?user_id=${user?._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        // Nếu API trả về một object, convert thành array
        if (Array.isArray(data)) {
          setStores(data);
        } else if (data.stores) {
          setStores(Array.isArray(data.stores) ? data.stores : []);
        } else {
          setStores([]);
        }
      } else {
        setError(data.message || "Không thể tải danh sách stores");
      }
    } catch (error) {
      console.error("Lỗi fetch stores:", error);
      setError("Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="seller-page-content"><p>Đang tải dữ liệu...</p></div>;
  }

  return (
    <div className="seller-page-content">
      <div className="page-header flex-between">
        <h1>Quản Lí Stores</h1>
        <div className="page-actions flex-center" style={{ gap: "10px" }}>
          <button 
            className="action-btn refresh-btn"
            onClick={fetchStores}
            title="Làm mới"
          >
            <IoRefresh size={20} />
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stores.length === 0 ? (
        <div className="empty-state">
          <p>Bạn chưa có store nào</p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Vui lòng liên hệ quản trị viên để tạo store
          </p>
        </div>
      ) : (
        <div className="stores-grid">
          {stores.map((store) => (
            <div key={store._id} className="store-card">
              <div className="store-card-header">
                <h3>{store.name}</h3>
                <span className={`store-status ${store.status}`}>
                  {store.status === "active" ? "Hoạt động" : "Tạm dừng"}
                </span>
              </div>
              <div className="store-card-body">
                <p><strong>Địa chỉ:</strong> {store.address}</p>
                <p><strong>SĐT:</strong> {store.phone}</p>
                <p><strong>Ngày tạo:</strong> {new Date(store.created_at).toLocaleDateString("vi-VN")}</p>
              </div>
              <div className="store-card-footer">
                <Link 
                  to={`/seller/store/${store._id}`}
                  className="store-btn"
                >
                  Quản Lí Sản Phẩm
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
