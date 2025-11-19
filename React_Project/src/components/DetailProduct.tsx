import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/DetailProduct.css";
import type { Product } from "../interfaces/Product";
import type { Store } from "../interfaces/Store";
import { BsCartPlusFill } from "react-icons/bs";
import { IoAdd } from "react-icons/io5";
import { GoDash } from "react-icons/go";

export function DetailProduct() {
  const [product, setProduct] = useState<Product | null>(null);
  const { _id } = useParams<{ _id: string }>();
  const [storeId, setStoreId] = useState<Store | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const user_id = "671f00000111111111111111"
  
  const add = () => {
    setQuantity(quantity + 1);
  }

  const subtract = () => {
    if(quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useEffect(() => {
    const productDetail = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/products/get/${_id}`
        );
        const data = await res.json();
        setProduct(data);        
        setStoreId(data.store_id);        
      } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      }
    };
    if (_id) productDetail();
  }, [_id]);

  useEffect(() => {
    const storeDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3000/stores/get/${storeId}`);
        const data = await res.json();
        setStore(data);
      } catch (error) {
        console.error("Lỗi hiển thị cửa hàng:", error);
      }
    };
    storeDetail();
  }, [storeId]);

  const addCart = async () => {
    if (!product) return;

    const data = {
      user_id,
      product_id: product._id,
      quantity,
      total_price: product.price * quantity,
    };

    try {
      const res = await fetch("http://localhost:3000/carts/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        alert(result.message || "Đã thêm sản phẩm vào giỏ hàng!");
      } else {
        alert(result.message || "Thêm vào giỏ hàng thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  if (!product) {
    return <p style={{ textAlign: "center" }}>Đang tải chi tiết sản phẩm...</p>;
  }

  return (
    <div className="detail-page">
      <div className="detail-wrapper flex-center">
        <img src={product.images[0].image_url} alt={product.name} />
        <div className="detail-content">
          <h2 style={{fontWeight: "bold"}}>{product.name}</h2>
          <p className="price">{product.price.toLocaleString()}đ</p>
          <p className="desc">{product.description}</p>
          <p className="store">{store?.name} ({store?.address})</p>

          <div className="quantity">
            <div className="dt-icon" onClick={subtract}>
              <GoDash />
            </div>
            <input type="number" value={quantity} name="quantity" min="1" max="100" defaultValue={quantity} />
            <div className="dt-icon" onClick={add}>
              <IoAdd />
            </div>
          </div>

          <div className="dt-btn">
            <div className="dt-icbtn" onClick={addCart}>
              <BsCartPlusFill />
              <span>Thêm vào giỏ</span>
            </div>
            <div className="dt-icbtn">Mua ngay</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailProduct;