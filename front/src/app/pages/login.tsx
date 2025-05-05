// app/pages/auth_register.tsx
import { useState } from 'react';
import '../css/pages/auth_register.css';
import { ApiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth-context';

function Login() {

  const { updateHeaderConnected } = useAuth();

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

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    let res
    try{
      const client = new ApiClient(formData.email, formData.password)
      res = await client.connect()
        
    } catch (e: any){
      console.log(e.response.data)
        for (const err in e.response.data){
          if(err !== "message"){
            newErrors.push(`${err} : ${e.response.data[err]}`)
          } else {
            newErrors.push(`${e.response.data[err]}`)
          }
        }
        setErrors(newErrors)
        return
    }

    if(res){
      updateHeaderConnected()
      setErrors([]);
      navigate('/account');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>
        
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

          <button type="submit" className="submit-btn">Se connecter</button>
        </form>

        <div className="switch-mode">
          <p>
            Pas encore de compte ? 
            <button 
              type="button" 
              className="link-btn"
              onClick={() => {
                navigate("/register")
              }}
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
