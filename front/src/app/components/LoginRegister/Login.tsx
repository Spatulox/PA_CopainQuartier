import { useState } from 'react';
import '../Forms/form.css';
import { ApiClient } from '../../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth-context';
import Form from '../Forms/Forms';

const loginFields = [
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Mot de passe", type: "password" },
];

function Login() {
  const { updateHeaderConnected } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];
    if (!formData.email.includes('@')) newErrors.push('Email invalide');
    if (formData.password.length < 6) newErrors.push('Le mot de passe doit contenir au moins 6 caractères');
    if (newErrors.length > 0) { setErrors(newErrors); return; }
    let res;
    try {
      const client = new ApiClient(formData.email, formData.password);
      res = await client.connect();
    } catch (e: any) {
      for (const err in e.response.data) {
        newErrors.push(`${err !== "message" ? err + " : " : ""}${e.response.data[err]}`);
      }
      setErrors(newErrors);
      return;
    }
    if (res) {
      updateHeaderConnected();
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
      switchText="Pas encore de compte ?"
      onSwitch={() => navigate("/register")}
      submitLabel="Se connecter"
    />
  );
}

export default Login;
