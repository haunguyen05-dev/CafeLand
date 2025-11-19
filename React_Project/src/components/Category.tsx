import { useState, useEffect } from "react";
import type { Category } from "../interfaces/Category";

interface CategoryProps {
  onSelectCategory: (id: string | null) => void;
  selectedCategory: string | null;
}

export function Category({ onSelectCategory, selectedCategory }: CategoryProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const getCategory = async () => {
      try {
        const res = await fetch("http://localhost:3000/categories/get");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };
    getCategory();
  }, []);

  return (
    <div className="category-list">
      <div
        className={`category-item ${selectedCategory === null ? "active" : ""}`}
        onClick={() => onSelectCategory(null)}
      >
        Tất cả
      </div>

      {categories.length === 0 ? (
        <p>Đang tải danh mục...</p>
      ) : (
        categories.map((category) => (
          <div
            key={category._id}
            className={`category-item ${
              selectedCategory === category._id ? "active" : ""
            }`}
            onClick={() => onSelectCategory(category._id)}
          >
            {category.name}
          </div>
        ))
      )}
    </div>
  );
}

export default Category;