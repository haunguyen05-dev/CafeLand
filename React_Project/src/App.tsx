import { useState } from "react";
import { Link } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import { Category } from "./components/Category";
import { Product } from "./components/Product";
import { DetailProduct } from "./components/DetailProduct";
import { Searchbar } from "./components/Searchbar";
import { Logo } from "./components/Logo";
import { Cart } from "./components/Cart";

import { IoCart } from "react-icons/io5";

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  return (
    <Router>
      <div>
        <div className="logo-con flex-between">
          <Link to={"/"}>
            <Logo />                   
          </Link>
          <div className="header-btn flex-center">
            <Link to={"/cart"}>
              <div className="header-ic flex-center" style={{gap: "15px"}}>
                <IoCart />
                <span className="flex-center">GIỎ HÀNG</span>
              </div>
            </Link>
          </div>
        </div>
        <div className="header flex-center">
          <Searchbar onSearch={setSearchTerm} />  
        </div>
        <Category                             
          onSelectCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
        <div className="content flex-center">
          <Routes>
            <Route
              path="/"
              element={
                <Product
                  selectedCategory={selectedCategory}
                  searchTerm={searchTerm}      
                />
              }
            />
            <Route path="/product/:_id" element={<DetailProduct />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
