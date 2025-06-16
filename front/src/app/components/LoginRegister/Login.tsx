import { useState } from 'react';
import '../Forms/Form.css';
import { ApiClient } from '../../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth-context';
import Form from '../Forms/Forms';
import { Route } from '../../constantes';

const loginFields = [
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Mot de passe", type: "password" },
];

function Login() {
  const { updateConnection } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];
    if (!formData.email.includes('@')) newErrors.push('Email invalide');
    if (formData.password.length < 6) newErrors.push('Le mot de passe doit contenir au moins 8 caractères');
    if (newErrors.length > 0) { setErrors(newErrors); return; }
    let res;
    try {
      const client = new ApiClient(formData.email, formData.password);
      res = await client.connect();
    } catch (e: any) {
      console.error(e)
      if(e.hasOwnProperty("response")){
        for (const err in e.response.data) {
          newErrors.push(`${err !== "message" ? err + " : " : ""}${e.response.data[err]}`);
        }
        setErrors(newErrors);
      }
      return;
    }
    if (res) {
      updateConnection();
      setErrors([]);
      navigate('/account');
    }
  };

  return (
    <Form
    title="Connexion"
    fields={loginFields}
    formData={formData}
    setFormData={setFormData}
    errors={errors}
    onSubmit={handleSubmit}
    switchButtons={[
      {
        text: "Pas encore de compte ? ",
        buttonLabel: "Créer un compte",
        onClick: () => navigate(Route.register),
      },
      {
        text: "Mot de passe oublié ? ",
        buttonLabel: "Réinitialiser",
        onClick: () => navigate(Route.resetPassword),
      },
    ]}
    submitLabel="Se connecter"
  />
  );
}

export default Login;
