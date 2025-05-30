import './header.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';
import { ApiClient } from '../../../api/client';
import { Route } from '../../constantes';

import "../Popup/Popup.css"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, isAdmin, updateConnection } = useAuth();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  function handleLogout() {
    const user = new ApiClient
    user.deconnection()
    updateConnection()
    navigate("/");
  }

  const openAdminMenu = () => setIsAdminMenuOpen(true);
  const closeAdminMenu = () => setIsAdminMenuOpen(false);
  const toggleAdminMenu = (e: any) => {
    e.stopPropagation();
    setIsAdminMenuOpen((v) => !v);
  };


  return (
    <>
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
            type="search"
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
                <Link to={Route.activity}>Activity</Link>
                <Link to={Route.publications}>Publications</Link>
                <Link to={Route.troc}>Troc</Link>
                <div
                  id="manageListHeader"
                  onMouseEnter={openAdminMenu}
                  onMouseLeave={closeAdminMenu}
                >
                  <a
                    id="manageListHeaderTitle"
                    tabIndex={0}
                    onClick={toggleAdminMenu}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggleAdminMenu(e)}
                    aria-haspopup="true"
                    aria-expanded={isAdminMenuOpen}
                    style={{ cursor: 'pointer' }}
                  >
                    Gérer
                  </a>
                  <nav
                    id="manageListHeaderContent"
                    className={isAdminMenuOpen ? "active" : ""}
                  >
                    <ul>
                      <li><Link to={Route.manageActivity}>Gérer les activités</Link></li>
                      <li><Link to={Route.managePublications}>Gérer les publications</Link></li>
                      <li><Link to={Route.manageTrocs}>Gérer les trocs</Link></li>
                      <li><Link to={Route.manageChannels}>Gérer les channels</Link></li>
                      <li><Link to={Route.manageUser}>Gérer les utilisateurs</Link></li>
                    </ul>
                  </nav>
                </div>

                <Link to={Route.account}>Compte</Link>
                <a href={Route.base} onClick={handleLogout}>Se déconnecter</a>
              </>
            ) : (
              <Link to={Route.login}>Se connecter</Link>
            )}
          </nav>
        </div>
      </div>
      <div id="popup-slide" className="popup-slide">
            The popup slide
      </div>
    </header>
    </>
  );
}

export default Header;
