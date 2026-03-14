import { useState } from "react";
import { VscSearch } from "react-icons/vsc";
import { Link } from "react-router-dom";
import "./Banner.css";

const Banner = () => {
  const [menu, setMenu] = useState(false);

  const menuHandler = () => {
    setMenu(!menu);
  }

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
          <button className={`banner-nav-btn ${menu ? "open" : ""}`} onClick={menuHandler}>
            <span className="first-line"></span>
            <span className="second-line"></span>
            <span className="third-line"></span>
          </button>
          <Link to="/categories" className="banner-nav-categories">Categorias</Link>
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