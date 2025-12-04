import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import type { Product, Image } from "../../../interfaces/Product";

interface AddEditProductModalProps {
  storeId: string;
  product?: Product | null; // Nếu có thì là Edit, không có là Add
  onClose: () => void;
  onSave: (formData: FormData, isEdit: boolean) => void; // truyền isEdit để backend biết
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
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageInput, setImageInput] = useState(""); // input để hiển thị URL đầu tiên

  useEffect(() => {
    fetchCategories();

    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price.toString());
      setCategoryId(product.category_id);
      setStatus(product.status);
      setImages(product.images || []);
      if (product.images && product.images.length > 0) {
        setImageInput(product.images[0].image_url); // hiển thị ảnh đầu tiên
      }
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3000/categories/get");
      const data = await res.json();
      if (res.ok) {
        setCategories(Array.isArray(data) ? data : data.categories || []);
      }
    } catch (error) {
      console.error("Lỗi fetch categories:", error);
    }
  };

  const handleImageChange = (url: string) => {
    setImageInput(url);
    // Cập nhật ảnh đầu tiên
    const newImages: Image[] = [
      {
        image_url: url,
        is_primary: true,
        created_at: new Date().toISOString(),
      },
      ...images.slice(1),
    ];
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("store_id", storeId);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", categoryId);
      formData.append("status", status);
      formData.append("images", JSON.stringify(images));

      if (product?._id) formData.append("_id", product._id);

      await onSave(formData, !!product?._id);
    } catch (error) {
      console.error("Lỗi submit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header flex-between">
          <h2>{product ? "Sửa Sản Phẩm" : "Thêm Sản Phẩm"}</h2>
          <button className="modal-close" onClick={onClose} disabled={loading}>
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
              onChange={e => setName(e.target.value)}
              placeholder="Nhập tên sản phẩm"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô Tả</label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
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
                onChange={e => setPrice(e.target.value)}
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
                onChange={e => setCategoryId(e.target.value)}
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng Thái</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Hình Ảnh (URL)</label>
            <input
              type="text"
              placeholder="Nhập URL hình ảnh"
              value={imageInput}
              onChange={e => handleImageChange(e.target.value)}
            />
            {imageInput && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={imageInput}
                  alt="Preview"
                  style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
