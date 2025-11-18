import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import "../css/VnPayReturn.css"; // Tạo file CSS này để style

// Định nghĩa các kiểu dữ liệu cho thông báo
interface MessageState {
  title: string;
  message: string;
  isSuccess: boolean;
}

export function VnPayReturn() {
  const [messageState, setMessageState] = useState<MessageState | null>(null);
  const location = useLocation();

  useEffect(() => {
    // 1. Lấy các tham số từ URL
    const params = new URLSearchParams(location.search);
    const responseCode = params.get("vnp_ResponseCode");
    const transactionNo = params.get("vnp_TransactionNo"); // Mã giao dịch VNPAY
    const amount = params.get("vnp_Amount"); // Số tiền (đã * 100)

    // 2. Kiểm tra kết quả
    if (responseCode === "00") {
      // Giao dịch thành công

      // === PHẦN SỬA LỖI Ở ĐÂY ===
      // Định dạng lại số tiền (chia cho 100 và thêm 'đ')
      const formattedAmount = (Number(amount) / 100).toLocaleString('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
      });

      setMessageState({
        title: "Thanh toán thành công!",
        // Sử dụng biến 'formattedAmount' ở đây
        message: `Bạn đã thanh toán thành công số tiền ${formattedAmount}. Mã giao dịch VNPAY của bạn là ${transactionNo}.`,
        isSuccess: true,
      });
      // === KẾT THÚC PHẦN SỬA ===

    } else {
      // Giao dịch thất bại
      setMessageState({
        title: "Thanh toán thất bại!",
        message: `Giao dịch không thành công. Mã lỗi: ${responseCode}. Vui lòng thử lại.`,
        isSuccess: false,
      });
    }
  }, [location]); // Chạy mỗi khi URL thay đổi

  if (!messageState) {
    return <p style={{ textAlign: "center" }}>Đang xử lý kết quả thanh toán...</p>;
  }

  return (
    <div className="vnpay-return-page">
      <div className={`return-container ${messageState.isSuccess ? "success" : "failure"}`}>
        {/* Bạn có thể dùng icon ở đây */}
        <h2>{messageState.title}</h2>
        <p>{messageState.message}</p>
        <Link to="/" className="return-home-btn">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}