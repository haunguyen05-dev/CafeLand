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
  const [orders, setOrders] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (id) fetchStoreAndProducts();
  }, [id]);

  // ================= SAFE JSON PARSER =================
  const safeJson = async (res: Response) => {
    const text = await res.text(); // lấy raw text để tránh lỗi parse
    console.log("RAW RESPONSE:", text);

    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("JSON PARSE FAILED:", e);
      return null;
    }
  };

  // ================= FETCH STORE + PRODUCTS + ORDERS =================
  const fetchStoreAndProducts = async () => {
    try {
      setLoading(true);

      // ==== STORE ====
      const storeRes = await fetch(`http://localhost:3000/stores/get/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const storeData = await safeJson(storeRes);
      if (storeRes.ok && storeData) {
        setStore(storeData.store || storeData);
      } else {
        console.warn("STORE API trả rỗng hoặc lỗi");
      }

      // ==== PRODUCTS ====
      const productsRes = await fetch(`http://localhost:3000/products/store/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const productsData = await safeJson(productsRes);
      setProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData?.products || []
      );

      // ==== ORDERS ====
      const ordersRes = await fetch(`http://localhost:3000/orders/store/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const ordersData = await safeJson(ordersRes);
      setOrders(
        Array.isArray(ordersData)
          ? ordersData
          : ordersData?.orders || []
      );

    } catch (error) {
      console.error("Fetch ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= CRUD PRODUCT =================

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
    if (!deletingProduct) return;
    try {
      const res = await fetch(`http://localhost:3000/products/${deletingProduct._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const data = await safeJson(res);
      if (res.ok) {
        alert("Xóa thành công!");
        setProducts(products.filter((p) => p._id !== deletingProduct._id));
      } else {
        alert(data?.message || "Xóa thất bại");
      }

    } catch (error) {
      alert("Không thể kết nối server");
    }

    setShowDeleteModal(false);
    setDeletingProduct(null);
  };

  const handleSaveProduct = async (formData: FormData) => {
    try {
      const url = editingProduct
        ? `http://localhost:3000/products/update/${editingProduct._id}`
        : "http://localhost:3000/products/add";

      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      const data = await safeJson(res);

      if (res.ok) {
        alert(editingProduct ? "Cập nhật thành công!" : "Thêm thành công!");
        setShowAddModal(false);
        setEditingProduct(null);
        fetchStoreAndProducts();
      } else {
        alert(data?.message || "Lỗi không xác định");
      }

    } catch (error) {
      alert("Không thể kết nối server");
    }
  };

  // ================ UI RENDER ================

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!store) return <p>Không tìm thấy store</p>;

  const statusMap: Record<string, string> = {
    pending: "Chờ xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  return (
    <div className="store-detail-container">

      {/* HEADER */}
      <div className="detail-header flex-between">
        <div className="flex-center" style={{ gap: "15px" }}>
          <button className="back-btn" onClick={() => navigate("/seller")}>
            <IoArrowBack size={20} />
          </button>

          <div>
            <h1>{store.name}</h1>
            <p>{store.address} | {store.phone}</p>
          </div>
        </div>

        <div className="detail-actions flex-center" style={{ gap: "10px" }}>
          <button className="action-btn refresh-btn" onClick={fetchStoreAndProducts}>
            <IoRefresh size={20} />
          </button>

          <button className="action-btn add-btn" onClick={handleAddProduct}>
            <IoAdd size={20} /><span>Thêm Sản Phẩm</span>
          </button>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="products-table">
        <h2>Danh Sách Sản Phẩm</h2>

        {products.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có sản phẩm</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên</th>
                <th>Giá</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p._id}>
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.price.toLocaleString("vi-VN")} ₫</td>
                  <td>{p.category_id}</td>
                  <td>
                    <span className={`status-badge ${p.status}`}>
                      {p.status === "active" ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditProduct(p)}>
                      <IoPencil />
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteProduct(p)}>
                      <IoTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ORDERS TABLE */}
      <div className="products-table" style={{ marginTop: "40px" }}>
        <h2>Danh Sách Đơn Hàng</h2>

        {orders.length === 0 ? (
          <div className="empty-state"><p>Chưa có đơn hàng</p></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã Đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>{index + 1}</td>
                  <td>{order._id}</td>
                  <td>{order.user_id}</td>
                  <td>{order.total_amount.toLocaleString("vi-VN")} ₫</td>

                  <td>
                    <span className={`status-badge ${order.order_status}`}>
                      {statusMap[order.order_status] || order.order_status}
                    </span>
                  </td>

                  <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}
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
