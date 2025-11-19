import { useState } from "react";
import { IoSearch } from "react-icons/io5";
import "../css/Searchbar.css";

interface SearchbarProps {
  onSearch: (term: string) => void;
}

export function Searchbar({ onSearch }: SearchbarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="searchbar">
      <input
        type="text"
        placeholder="Tìm kiếm cafe, trà sữa, trà trái cây,..."
        value={searchTerm}
        onChange={handleChange}
      />
      <div className="s-icon flex-center">
        <IoSearch className="search-icon" />
      </div>
    </div>
  );
}

export default Searchbar;