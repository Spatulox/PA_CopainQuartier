import './header.css';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './auth-context';
import { ApiClient } from '../../../api/client';
import { Route } from '../../constantes';
import "../Popup/Popup.css"
import "./header.css"
import { SearchClass, SearchReturn } from '../../../api/search';
import { useTheme } from './theme';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isConnected, isAdmin, updateConnection, clearConnection } = useAuth();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [search, setSearch] = useState<string>()
  const [results, setResults] = useState<SearchReturn | null>()
  const [theme, setTheme] = useTheme() // Unused here, but it run in the background once imported, so we need to import it here
  const [open, setOpen] = useState(false)

  const searchResultRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  function handleLogout() {
    const user = new ApiClient
    user.deconnection()
    updateConnection()
    clearConnection()
    navigate("/");
  }

  const openAdminMenu = () => setIsAdminMenuOpen(true);
  const closeAdminMenu = () => setIsAdminMenuOpen(false);
  const toggleAdminMenu = (e: any) => {
    e.stopPropagation();
    setIsAdminMenuOpen((v) => !v);
  };

  useEffect(() => {
    if (search === "") return;

    if(search != undefined){
      const handler = setTimeout(() => {
        searchData(search);
      }, 500);
      return () => clearTimeout(handler);
    }
  }, [search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const popup = searchResultRef.current;
      const input = searchBarRef.current;
      const target = event.target as Node;

      if (
        (popup && popup.contains(target)) ||
        (input && input.contains(target))
      ) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    }

    if (search && results) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [search, results]);


  async function searchData(data: string) {
    const client = new SearchClass();
    try {
      const res = await client.searchData(data);
      setResults(res)
      setOpen(true)
    } catch (error) {
      console.error(error);
      setResults(null)
      setOpen(false)
    }
  }

  const handleInput = (event: any) => {
    setSearch(event.currentTarget.value);
  };

  function handleNavigate(link: string){
      navigate(link)
      setOpen(false)
  }

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
          <img src="/logo.png" alt="Logo" className="logo" onClick={() => navigate(Route.base)} />
        </div>

        {/* Partie centrale */}
        <div className="header-section search-section">
          <input
            ref={searchBarRef}
            type="search"
            placeholder="Rechercher..."
            className="search-bar"
            value={search}
            onInput={handleInput}
          />
          {results && open && (
            <div className='search-result' ref={searchResultRef}>
              {results.activity.length > 0 && (
                <div className='search-item'>Activities:
                {results.activity.map((act) => (
                  <div onClick={() => handleNavigate(`${Route.activity}/${act._id}`)}>{act.title}</div>
                ))}
                </div>
              )}
              {results.publication.length > 0 && (
                <div className='search-item'>Publications:
                {results.publication.map((act) => (
                  <div onClick={() => handleNavigate(`${Route.publications}/${act._id}`)}>{act.name}</div>
                ))}
              </div>
              )}
              {results.troc.length > 0 && (
                <div className='search-item'>Trocs
                {results.troc.map((act) => (
                  <div onClick={() => handleNavigate(`${Route.troc}/${act._id}`)}>{act.title}</div>
                ))}
              </div>
              )}
            </div>
          )}
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
                {isAdmin  && (
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
                        <li><Link to={Route.requestDB}>Request la BDD</Link></li>
                        <li><Link to={Route.java}>Gérer Java</Link></li>
                      </ul>
                    </nav>
                  </div>
                  )}

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
