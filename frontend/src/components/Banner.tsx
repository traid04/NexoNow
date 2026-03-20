import { useState, useEffect } from "react";
import { VscSearch } from "react-icons/vsc";
import { IoIosArrowDown } from "react-icons/io";
import { Link } from "react-router-dom";
import getCategories from "../services/categoriesService";
import "./Banner.css";
import type { Category } from "../types/types";
import { toSlug } from "../helpers/toSlug";

const Banner = () => {
  const [menu, setMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [categoriesData, setCategoriesData] = useState([]);

  const handleMenu = () => {
    setMenu(!menu);
  }

  useEffect(() => {
    const fetchCategories = (async () => {
      const c = await getCategories();
      setCategoriesData(c);
    });
    fetchCategories();
  }, []);

  return (
    <>
      <header className="banner">
        <Link to="/">
          <img src="/logo.png" className="banner-logo" />
        </Link>
        <div className="banner-searchbar">
          <input type="text" placeholder="Buscar artículos" className="banner-searchbar-text" />
          <button className="banner-searchbar-submit"><VscSearch /></button>
        </div>
        <nav className="banner-nav">
          <button className={`banner-nav-btn ${menu ? "open" : ""}`} onClick={handleMenu}>
            <span className="first-line"></span>
            <span className="second-line"></span>
            <span className="third-line"></span>
          </button>
          <Link to="/offers" className="banner-nav-offers">Ofertas</Link>
          <div className="banner-nav-categories-container" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <Link to="/" className="banner-nav-categories">Categorias <IoIosArrowDown className="banner-nav-categories-arrow" /></Link>
            {isHovered && <nav className="banner-categories">
              <ul className="banner-categories-list">
                {categoriesData.map((c: Category) => <li key={c.id} className="banner-categories-list-category">
                  <Link to={`/categories/${toSlug(c.name)}`} className="banner-categories-list-category-font">{c.name}</Link></li>)}
              </ul>
            </nav>}
          </div>
          <Link to="/login" className="banner-nav-login">Ingresa</Link>
          <Link to="/register" className="banner-nav-register">Regístrate</Link>
        </nav>
      </header>
      {menu && <nav className="banner-mobile-menu">
        <Link to="/categories" className="banner-mobile-categories">Categorias</Link>
        <Link to="/login" className="banner-mobile-login">Ingresa</Link>
        <Link to="/register" className="banner-mobile-register">Regístrate</Link>
      </nav>}
    </>
  )
}

export default Banner;