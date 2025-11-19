import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import type { Product } from "../../../interfaces/Product";

interface AddEditProductModalProps {
  storeId: string;
  product?: Product | null;
  onClose: () => void;
  onSave: (formData: FormData) => void;
}

export default function AddEditProductModal({
  storeId,
  product,
  onClose,
  onSave,
}: AddEditProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("active");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    // Fetch danh mục
    fetchCategories();

    // Nếu đang edit, populate dữ liệu
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategoryId(product.category_id);
      setStatus(product.status);
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/category");
      const data = await res.json();
      if (res.ok) {
        setCategories(Array.isArray(data) ? data : data.categories || []);
      }
    } catch (error) {
      console.error("Lỗi fetch categories:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", categoryId);
      formData.append("status", status);
      formData.append("store_id", storeId);

      // Thêm hình ảnh nếu có
      images.forEach((image) => {
        formData.append("images", image);
      });

      await onSave(formData);
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header flex-between">
          <h2>{product ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm"}</h2>
          <button 
            className="modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Tên Sản Phẩm *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô Tả</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả sản phẩm"
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Giá (₫) *</label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Nhập giá"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Danh Mục *</label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng Thái</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="images">Hình Ảnh</label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            {images.length > 0 && (
              <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>
                {images.length} hình ảnh được chọn
              </p>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
