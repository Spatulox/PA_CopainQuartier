// app/pages/auth_register.tsx
import { useState } from 'react';
import '../css/pages/auth_register.css';
import { ApiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    const newErrors = [];

    // Validation basique
    if (!formData.email.includes('@')) {
      newErrors.push('Email invalide');
    }
    if (formData.password.length < 6) {
      newErrors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.push('Les mots de passe ne correspondent pas');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Logique de soumission
    console.log('Soumission du formulaire :', formData);
    const client = new ApiClient(formData.email, formData.password)
    await client.connect()
    setErrors([]);
    navigate('/account');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
        
        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <p key={index} className="error">⚠️ {error}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>

        <div className="switch-mode">
          <p>
            {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <button 
              type="button" 
              className="link-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors([]);
                setFormData({...formData, confirmPassword: ''});
              }}
            >
              {isLogin ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
