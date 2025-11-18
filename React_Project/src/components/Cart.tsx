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

    const storedUser = localStorage.getItem("user");
    const user_id = storedUser ? JSON.parse(storedUser)._id : null;


    useEffect(() => {
    if (!user_id) return; 
    const fetchCart = async () => {
        
        try {
        const res = await fetch(`http://localhost:3000/carts/get/${user_id}`);
        const data = await res.json();

        setCartItems(data[0]?.items || []);
        } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        }
    };

    fetchCart();
    }, [user_id]);

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

    if (loading) return <p style={{ textAlign: "center" }}>Đang tải giỏ hàng...</p>;

    if (mergedCart.length === 0)
    return <p style={{ textAlign: "center" }}>Giỏ hàng của bạn đang trống.</p>;

    const total = mergedCart.reduce((sum, item) => sum + item.total_price, 0);

    const onClickOrder = async () => {
        try{
            const order = {
                amount: total,
                bankCode:"",
                language: "vn",
                user_id: user_id,
            };

            const url = "http://localhost:3000/orders/create_payment_url";
            const response = await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(order),
            });

            const result = await response.json();

            if (result.paymentUrl){
                window.location.href = result.paymentUrl;
            }else{
                alert("Không thể tao đường dẫn thanh toán. Vui lòng thử lại");
                console.error("Lỗi khi nhận paymentUrl:", result);
            }
        } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            alert("Đã xảy ra lỗi khi kết nối đến máy chủ thanh toán");
        }
    };

    return (
        <div className="cart-page">
            <h2>GIỎ HÀNG CỦA BẠN</h2>
            <div className="cart-list">
                {mergedCart.map((item, index) => (
                    <div className="cart-item" key={index}>
                        <img src={ item.product?.images?.[0]?.image_url || "https://via.placeholder.com/100" } alt={item.product?.name || "Sản phẩm"} />
                        <div className="cart-info">
                            <h3>{item.product?.name || "Sản phẩm không xác định"}</h3>
                            <p>Số lượng: {item.quantity}</p>
                            <p>
                                Thành tiền:{" "}{item.total_price ? item.total_price.toLocaleString() : item.product?.price?.toLocaleString() || 0}đ
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-total">
                <h3>Tổng cộng: {total.toLocaleString()}đ</h3>
                <button className="checkout-btn" onClick={onClickOrder}>
                    Thanh toán
                    </button>
            </div>
        </div>
    );
}
