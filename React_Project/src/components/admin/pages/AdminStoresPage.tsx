
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Store } from "../types";
import "../../../css/admin.css";

const API = "http://localhost:3000";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    status: "active",
  });

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/stores/get`);
      const data = await res.json();
      setStores(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách cửa hàng");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API}/stores/update/${editingId}`
        : `${API}/stores/create`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Request thất bại");

      setEditingId(null);
      setForm({ name: "", address: "", phone: "", status: "active" });
      await fetchStores();
    } catch (err) {
      console.error(err);
      setError("Lưu cửa hàng thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Xóa cửa hàng này?")) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/stores/delete/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      await fetchStores();
    } catch (err) {
      console.error(err);
      setError("Xóa cửa hàng thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Quản lý cửa hàng</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="admin-section-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Sửa cửa hàng" : "Thêm cửa hàng mới"}</h3>

          <label>
            Tên
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Địa chỉ
            <input name="address" value={form.address} onChange={handleChange} />
          </label>
          <label>
            SĐT
            <input name="phone" value={form.phone} onChange={handleChange} />
          </label>
          <label>
            Trạng thái
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>

          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <button type="submit">{editingId ? "Cập nhật" : "Tạo"}</button>
            {editingId && (
              <button type="button" onClick={() => setEditingId(null)}>
                Hủy
              </button>
            )}
          </div>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Địa chỉ</th>
              <th>SĐT</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.address}</td>
                <td>{s.phone}</td>
                <td>{s.status}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-edit" type="button" onClick={() => {
                      setEditingId(s._id);
                      setForm({
                        name: s.name,
                        address: s.address || "",
                        phone: s.phone || "",
                        status: s.status || "active",
                      });
                    }}>
                      Sửa
                    </button>
                    <button className="btn-delete" type="button" onClick={() => handleDelete(s._id)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
