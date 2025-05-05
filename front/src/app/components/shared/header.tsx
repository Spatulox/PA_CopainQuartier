import './header.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';
import { ApiClient } from '../../../api/client';
import { Route } from '../../constantes';

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

        {/* Menu burger */}
        <div 
          className={`burger-menu ${isMenuOpen ? 'open' : ''}`} 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Partie gauche */}
        <div className="header-section logo">
          <img src="/logo.png" alt="Logo" className="logo" />
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
            <Link to="/">Accueil</Link>
            {isConnected ? (
              <>
                <Link to={Route.chat}>Chat</Link>
                <Link to={Route.publications}>Publications</Link>
                <Link to={Route.account}>Compte</Link>
                <a href={Route.base} onClick={handleLogout}>Se déconnecter</a>
              </>
            ) : (
              <Link to={Route.login}>Se connecter</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
