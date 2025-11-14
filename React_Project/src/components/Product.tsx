import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../interfaces/Product";
import "../css/Product.css"
import { BsCartPlusFill } from "react-icons/bs";

interface ProductProps {
  selectedCategory: string | null;
  searchTerm?: string;  
}

export function Product({ selectedCategory, searchTerm = "" }: ProductProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);

        const url = selectedCategory
          ? `http://localhost:3000/products/category/${selectedCategory}`
          : `http://localhost:3000/products/get`;

        const res = await fetch(url);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    getProduct();
  }, [selectedCategory]);

  if (loading) return <p>Đang tải sản phẩm...</p>;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ul className="product-list">
      {filtered.length === 0 ? (
        <p>Không có sản phẩm phù hợp.</p>
      ) : (
        filtered.map((product) => (
          <li key={product._id} className="product-item">
            <Link to={`/product/${product._id}`}>
              <p style={{ fontWeight: 550, marginBottom: "10px", marginTop: "15px", fontSize: "1.05rem", color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block", width: "100%" }}>{product.name.toUpperCase()}</p>
              <img src={product.images[0].image_url} alt={product.name} />
            </Link>
            <div className="pd-footer flex-center">
              <div className="btn">
                <div className="icon">
                  <BsCartPlusFill />
                </div>
              </div>
              <p style={{color: "#c23e00ff", fontSize: "20px", alignItems: "flex-end", textAlign: "end"}}>{product.price.toLocaleString()}đ</p>
            </div>
          </li>
        ))
      )}
    </ul>
  );
}
