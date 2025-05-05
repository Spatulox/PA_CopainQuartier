// app/pages/auth_register.tsx
import { useState } from 'react';
import '../css/pages/auth_register.css';
import { ApiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth-context';

function Register() {

  const { updateHeaderConnected } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    phone: '',
    address: '',
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
    if (formData.password.length < 8) {
      newErrors.push('Le mot de passe doit contenir au moins 8 caractères');
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
    let res
    try{
        res = await client.register(formData)
    } catch (e: any){
        for (const err in e.response.data){
            newErrors.push(`${err} : ${e.response.data[err]}`)
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
        <h2>Inscription</h2>
        
            {errors.length > 0 && (
            <div className="error-messages">
                {errors.map((error, index) => (
                <p key={index} className="error">⚠️ {error}</p>
                ))}
            </div>
            )}

            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label>Nom</label>
                    <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                    required
                    />
                </div>

                <div className="form-group">
                    <label>Prenom</label>
                    <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    />
                </div>

                <div className="form-group">
                    <label>Téléphone</label>
                    <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    />
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    required
                    />
                </div>

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

            
                <div className="form-group">
                    <label>Confirmer le mot de passe</label>
                    <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                    />
                </div>

                <button type="submit" className="submit-btn">S'inscrire</button>
            </form>

        <div className="switch-mode">
          <p>
            Déjà un compte ?
            <button 
              type="button" 
              className="link-btn"
              onClick={() => {
                navigate("/login")
              }}
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
