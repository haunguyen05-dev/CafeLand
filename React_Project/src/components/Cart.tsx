import { useEffect, useState } from "react";
import type { Product } from "../interfaces/Product";
import "../css/Cart.css";

interface CartItem {
  product_id: string;
  quantity: number;
  total_price: number;
  product?: Product;
}

export function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [voucherMessage, setVoucherMessage] = useState("");
  const [applying, setApplying] = useState(false);

  const user_id = "671f00000111111111111111";

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/carts/get/${user_id}`
        );
        const data = await res.json();

        setCartItems(data[0]?.items || []);
      } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/products/get");
        const data = await res.json();

        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  const mergedCart = cartItems.map((item) => {
    const product = products.find((p) => p._id === item.product_id);
    return { ...item, product: product };
  });

  if (loading)
    return <p style={{ textAlign: "center" }}>Đang tải giỏ hàng...</p>;

  if (mergedCart.length === 0)
    return <p style={{ textAlign: "center" }}>Giỏ hàng của bạn đang trống.</p>;

  const total = mergedCart.reduce(
    (sum, item) => sum + item.total_price,
    0
  );
  const finalTotal = Math.max(total - discount, 0);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherMessage("Vui lòng nhập mã voucher.");
      setDiscount(0);
      return;
    }

    try {
      setApplying(true);
      setVoucherMessage("Đang kiểm tra mã...");

      const res = await fetch("http://localhost:3000/vouchers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: voucherCode.trim(),
          order_amount: total,
          user_id,
          store_id: null, // nếu đơn thuộc 1 shop cố định thì truyền id
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setDiscount(0);
        setVoucherMessage(data.message || "Voucher không áp dụng được.");
        return;
      }

      setDiscount(data.discount);
      setVoucherMessage(
        `Áp dụng thành công. Giảm ${data.discount.toLocaleString()}đ, còn ${data.final_amount.toLocaleString()}đ.`
      );
    } catch (error) {
      console.error("Lỗi áp dụng voucher:", error);
      setDiscount(0);
      setVoucherMessage("Có lỗi khi áp dụng voucher.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-wrapper">
        <h2>GIỎ HÀNG CỦA BẠN</h2>

        <div className="cart-list">
          {mergedCart.map((item, index) => (
            <div className="cart-item" key={index}>
              <img
                src={
                  item.product?.images?.[0]?.image_url ||
                  "https://via.placeholder.com/100"
                }
                alt={item.product?.name || "Sản phẩm"}
              />
              <div className="cart-info">
                <h3>{item.product?.name || "Sản phẩm không xác định"}</h3>
                <p>Số lượng: {item.quantity}</p>
                <p>
                  Thành tiền:{" "}
                  {item.total_price
                    ? item.total_price.toLocaleString()
                    : item.product?.price?.toLocaleString() || 0}
                  đ
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <div className="cart-voucher-row">
            <input
              type="text"
              placeholder="Nhập mã voucher..."
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
            />
            <button
              type="button"
              onClick={handleApplyVoucher}
              disabled={applying}
            >
              {applying ? "Đang áp..." : "Áp dụng"}
            </button>
          </div>
          {voucherMessage && (
            <p className="cart-voucher-message">{voucherMessage}</p>
          )}

          <h3>Tạm tính: {total.toLocaleString()}đ</h3>
          <p>Giảm giá: -{discount.toLocaleString()}đ</p>
          <h3>Thanh toán: {finalTotal.toLocaleString()}đ</h3>

          <button className="checkout-btn">Thanh toán</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;