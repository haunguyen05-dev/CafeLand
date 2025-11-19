import { IoWarning, IoClose } from "react-icons/io5";

interface DeleteConfirmModalProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  productName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content modal-sm">
        <div className="modal-header flex-between">
          <h2>Xác Nhận Xóa</h2>
          <button 
            className="modal-close"
            onClick={onCancel}
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ textAlign: "center", padding: "20px" }}>
          <IoWarning size={48} style={{ color: "#dc3545", marginBottom: "15px" }} />
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>
            Bạn chắc chắn muốn xóa sản phẩm này?
          </p>
          <p style={{ fontSize: "14px", color: "#666", fontWeight: "bold" }}>
            {productName}
          </p>
          <p style={{ fontSize: "12px", color: "#999", marginTop: "10px" }}>
            Hành động này không thể hoàn tác
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn-delete"
            onClick={onConfirm}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
