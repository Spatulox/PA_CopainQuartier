// shared/footer.tsx
import '../css/shared/footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Partie gauche */}
        <div className="footer-section">
          <h3>À propos de nous</h3>
          <p>
            Nous sommes une entreprise spécialisée dans le développement web et les solutions numériques.
          </p>
        </div>

        {/* Partie centrale */}
        <div className="footer-section">
          <h3>Liens utiles</h3>
          <ul>
            <li><a href="/services">Nos services</a></li>
            <li><a href="/contact">Contactez-nous</a></li>
            <li><a href="/mentions-legales">Mentions légales</a></li>
          </ul>
        </div>

        {/* Partie droite */}
        <div className="footer-section social-links">
          <h3>Suivez-nous</h3>
          <ul>
            <li>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <i className="fa fa-facebook" aria-hidden="true"></i>
              </a>
            </li>
            <li>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <i className="fa fa-twitter" aria-hidden="true"></i>
              </a>
            </li>
            <li>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <i className="fa fa-instagram" aria-hidden="true"></i>
              </a>
            </li>
          </ul>
        </div>

        {/* Informations de contact */}
        <div className="footer-section contact-info">
          <h3>Informations de contact</h3>
          <p>
            Adresse : 123 rue de la Paix, Paris, France
          </p>
          <p>
            Téléphone : +33 1 23 45 67 89
          </p>
          <p>
            Email : <a href="mailto:info@example.com">info@example.com</a>
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div className="copyright">
        <p>&copy; 2023 Votre Entreprise. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

export default Footer;
