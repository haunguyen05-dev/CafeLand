import { useEffect, useState } from "react";
import type { Product } from "../interfaces/Product";
import "../css/Cart.css";
import { IoAdd } from "react-icons/io5";
import { GoDash } from "react-icons/go";
import { FiTrash2 } from "react-icons/fi";

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
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

    const storedUserString = localStorage.getItem("user");
    const storedUser = storedUserString ? JSON.parse(storedUserString) : null;
    const user_id = storedUser?._id || null;   
    
    useEffect(() => {
    if (!user_id) return; 
    const fetchCart = async () => {
        
        try {
        const res = await fetch(`http://localhost:3000/carts/get/${user_id}`);
        const data = await res.json();

        setCartItems(data[0]?.items || []);
        
        // Initialize quantities for each cart item
        const initialQuantities: { [key: string]: number } = {};
        data[0]?.items.forEach((item: CartItem) => {
            initialQuantities[item.product_id] = item.quantity;
        });
        setQuantities(initialQuantities);
        console.log(cartItems);
        
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


    const add = (productId: string) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: (prev[productId] || 1) + 1
        }));
    };

    const subtract = (productId: string) => {
        setQuantities(prev => {
            const currentQty = prev[productId] || 1;
            if (currentQty > 1) {
                return {
                    ...prev,
                    [productId]: currentQty - 1
                };
            }
            return prev;
        });
    };

    const handleRemoveItem = async (productId: string) => {
        if (!user_id) return;
        try {
            const res = await fetch(`http://localhost:3000/carts/remove`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, product_id: productId })
            });
            const result = await res.json();
            if (res.ok) {
                setCartItems(prev => prev.filter(item => item.product_id !== productId));
            } else {
                alert(result.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng.");
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
            alert("Đã xảy ra lỗi khi kết nối đến máy chủ.");
        }
    };

    const mergedCart = cartItems.map((item) => {
        const product = products.find((p) => p._id === item.product_id);
        const currentQuantity = quantities[item.product_id] || item.quantity;
        const updatedTotalPrice = currentQuantity * (product?.price || 0);
        return { ...item, product: product, quantity: currentQuantity, total_price: updatedTotalPrice };
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
                        <img src={item.product?.images?.[0]?.image_url || "https://via.placeholder.com/100"} alt={item.product?.name || "Sản phẩm"} />
                        <div className="cart-info">
                            <h3>{item.product?.name || "Sản phẩm không xác định"}</h3>
                            <div className="quantity">
                                <div className="dt-icon" onClick={() => subtract(item.product_id)}>
                                    <GoDash />
                                </div>
                                <input type="number" value={item.quantity} name="quantity" min="1" max="100" onChange={(e) => {
                                    const newQty = parseInt(e.target.value) || 1;
                                    if (newQty > 0) {
                                        setQuantities(prev => ({
                                            ...prev,
                                            [item.product_id]: newQty
                                        }));
                                    }
                                }} />
                                <div className="dt-icon" onClick={() => add(item.product_id)}>
                                    <IoAdd />
                                </div>
                            </div>
                            <p>
                                Thành tiền: <span className="total-price">{" "}{item.total_price ? item.total_price.toLocaleString() : item.product?.price?.toLocaleString() || 0}đ</span>
                            </p>
                        </div>
                        <button
                            className="remove-btn"
                            style={{ marginLeft: "20px", background: "#e74c3c", color: "white", border: "none", borderRadius: "6px", padding: "12px", cursor: "pointer", fontSize: "18px" }}
                            onClick={() => handleRemoveItem(item.product_id)}
                            title="Xóa sản phẩm"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-total">
                <h3>Tổng cộng: <span className="total-price">{total.toLocaleString()}đ</span></h3>
                <button className="checkout-btn" onClick={onClickOrder}>
                    Thanh toán
                </button>
            </div>
        </div>
    );
}
