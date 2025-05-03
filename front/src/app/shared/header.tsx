import '../css/shared/header.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';
import { ApiClient } from '../../api/client';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, updateHeaderConnected } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  function handleLogout() {
    //logout();
    const user = new ApiClient
    user.deconnection()
    updateHeaderConnected()
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-content">
        {/* Partie gauche */}
        <div className="header-section">
          <img src="/logo.png" alt="Logo entreprise" className="logo" />
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
            {isConnected ? (
              <a href="" onClick={handleLogout}>Se déconnecter</a>
            ) : (
              <Link to="/auth">Se connecter</Link>
            )}
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
