// shared/header.tsx
import { useState } from 'react';
import '../css/shared/header.css';
import { Link } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Partie gauche */}
        <div className="header-section">
          <img 
            src="/logo.png" 
            alt="Logo entreprise" 
            className="logo" 
          />
        </div>

        {/* Partie centrale */}
        <div className="header-section search-section">
          <input
            type="text"
            placeholder="Rechercher..."
            className="search-bar"
          />
        </div>

        {/* Partie droite */}
        <div className={`header-section nav-links ${isMenuOpen ? 'active' : ''}`}>
          <nav>
            <a href="/">Accueil</a>
            <a href="/services">Services</a>
            <a href="/contact">Contact</a>
            <Link to="/auth">Se Connecter</Link> {/* Modification ici */}
          </nav>
        </div>

        {/* Menu burger */}
        <div 
          className={`burger-menu ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}

export default Header;
