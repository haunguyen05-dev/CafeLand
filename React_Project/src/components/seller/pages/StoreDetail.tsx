import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { IoAdd, IoPencil, IoTrash, IoRefresh, IoArrowBack } from "react-icons/io5";
import type { Product } from "../../../interfaces/Product";
import type { Store } from "../../../interfaces/Store";
import AddEditProductModal from "../components/AddEditProductModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

export default function StoreDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) {
      fetchStoreAndProducts();
    }
  }, [id]);

  const fetchStoreAndProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // Lấy thông tin store
      const storeRes = await fetch(`http://localhost:3000/stores/get/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const storeData = await storeRes.json();
      if (storeRes.ok) {
        setStore(storeData.store || storeData);
      }

      // Lấy products của store
      const productsRes = await fetch(
        `http://localhost:3000/products/store/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const productsData = await productsRes.json();
      if (productsRes.ok) {
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || []);
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct || !id) return;

    try {
      const res = await fetch(`http://localhost:3000/product/${deletingProduct._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        alert("Xóa sản phẩm thành công!");
        setProducts(products.filter((p) => p._id !== deletingProduct._id));
      } else {
        const data = await res.json();
        alert(data.message || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi xóa:", error);
      alert("Không thể kết nối đến server");
    } finally {
      setShowDeleteModal(false);
      setDeletingProduct(null);
    }
  };

  const handleSaveProduct = async (formData: FormData) => {
    try {
      const url = editingProduct
        ? `http://localhost:3000/product/${editingProduct._id}`
        : "http://localhost:3000/product";

      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          editingProduct
            ? "Cập nhật sản phẩm thành công!"
            : "Thêm sản phẩm thành công!"
        );
        setShowAddModal(false);
        setEditingProduct(null);
        fetchStoreAndProducts();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Lỗi save:", error);
      alert("Không thể kết nối đến server");
    }
  };

  if (loading) {
    return (
      <div className="store-detail-container">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="store-detail-container">
        <p>Không tìm thấy store</p>
      </div>
    );
  }

  return (
    <div className="store-detail-container">
      <div className="detail-header flex-between">
        <div className="flex-center" style={{ gap: "15px" }}>
          <button 
            className="back-btn"
            onClick={() => navigate("/seller")}
            title="Quay lại"
          >
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1>{store.name}</h1>
            <p className="store-info">{store.address} | {store.phone}</p>
          </div>
        </div>
        <div className="detail-actions flex-center" style={{ gap: "10px" }}>
          <button 
            className="action-btn refresh-btn"
            onClick={fetchStoreAndProducts}
            title="Làm mới"
          >
            <IoRefresh size={20} />
          </button>
          <button 
            className="action-btn add-btn"
            onClick={handleAddProduct}
          >
            <IoAdd size={20} />
            <span>Thêm Sản Phẩm</span>
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có sản phẩm nào</p>
          <button 
            className="store-btn"
            onClick={handleAddProduct}
          >
            <IoAdd size={16} />
            Thêm sản phẩm đầu tiên
          </button>
        </div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên Sản Phẩm</th>
                <th>Giá</th>
                <th>Danh Mục</th>
                <th>Trạng Thái</th>
                <th>Ngày Tạo</th>
                <th>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td className="product-name">{product.name}</td>
                  <td className="price">{product.price.toLocaleString("vi-VN")} ₫</td>
                  <td>{product.category_id}</td>
                  <td>
                    <span className={`status-badge ${product.status}`}>
                      {product.status === "active" ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </td>
                  <td>{new Date(product.created_at).toLocaleDateString("vi-VN")}</td>
                  <td className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditProduct(product)}
                      title="Sửa"
                    >
                      <IoPencil size={16} />
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteProduct(product)}
                      title="Xóa"
                    >
                      <IoTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddEditProductModal
          storeId={id || ""}
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          productName={deletingProduct?.name || ""}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletingProduct(null);
          }}
        />
      )}
    </div>
  );
}
