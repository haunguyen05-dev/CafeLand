
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Voucher } from "../types";
import "../../../css/admin.css";

const API = "http://localhost:3000";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Voucher>({
    code: "",
    description: "",
    discount_type: "percent",
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    total_quantity: 0,
    per_user_limit: 1,
    status: "active",
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  async function fetchVouchers() {
    setLoading(true);
    const res = await fetch(`${API}/vouchers/get`);
    const data = await res.json();
    setVouchers(data);
    setLoading(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (
      name === "discount_value" ||
      name === "min_order_amount" ||
      name === "max_discount_amount" ||
      name === "total_quantity" ||
      name === "per_user_limit"
    ) {
      setForm((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API}/vouchers/update/${editingId}`
      : `${API}/vouchers/create`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setEditingId(null);
    await fetchVouchers();
  }

  function handleEdit(v: Voucher) {
    setEditingId(v._id || null);
    setForm(v);
  }

  async function handleDelete(id?: string) {
    if (!id || !window.confirm("Xóa voucher này?")) return;
    await fetch(`${API}/vouchers/delete/${id}`, { method: "DELETE" });
    await fetchVouchers();
  }

  return (
    <div>
      <h2>Quản lý voucher</h2>
      {loading && <p>Đang tải...</p>}

      <div className="admin-section-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <h3>{editingId ? "Sửa voucher" : "Thêm voucher mới"}</h3>

          <label>
            Mã
            <input name="code" value={form.code} onChange={handleChange} required />
          </label>

          <label>
            Mô tả
            <textarea name="description" value={form.description} onChange={handleChange} />
          </label>

          <label>
            Loại
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền (VNĐ)</option>
            </select>
          </label>

          <label>
            Giá trị
            <input
              type="number"
              name="discount_value"
              value={form.discount_value}
              onChange={handleChange}
            />
          </label>

          <label>
            Đơn tối thiểu
            <input
              type="number"
              name="min_order_amount"
              value={form.min_order_amount}
              onChange={handleChange}
            />
          </label>

          <label>
            Giảm tối đa
            <input
              type="number"
              name="max_discount_amount"
              value={form.max_discount_amount}
              onChange={handleChange}
            />
          </label>

          <label>
            Số lượng
            <input
              type="number"
              name="total_quantity"
              value={form.total_quantity}
              onChange={handleChange}
            />
          </label>

          <label>
            Giới hạn mỗi user
            <input
              type="number"
              name="per_user_limit"
              value={form.per_user_limit}
              onChange={handleChange}
            />
          </label>

          <label>
            Trạng thái
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </label>

          <button type="submit">
            {editingId ? "Cập nhật" : "Tạo mới"}
          </button>
        </form>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đơn tối thiểu</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v._id}>
                <td>{v.code}</td>
                <td>{v.discount_type}</td>
                <td>{v.discount_value}</td>
                <td>{v.min_order_amount}</td>
                <td>{v.status}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() => handleEdit(v)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => handleDelete(v._id)}
                    >
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
