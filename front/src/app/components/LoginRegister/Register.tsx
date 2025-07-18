import { useState } from 'react';
import '../Forms/Form.css';
import { ApiClient } from '../../../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/auth-context';
import Form from '../Forms/Forms';
import { Route } from '../../constantes';
import { CreateFormData } from '../../../api/utils/formData';
import { FieldForm } from '../Popup/PopupForm';

const registerFields : FieldForm[] = [
  { name: "lastname", label: "Nom", type: "text" },
  { name: "name", label: "Prenom", type: "text" },
  { name: "image", label: "Profile Image", type: "file", required: false },
  { name: "phone", label: "Téléphone", type: "tel" },
  { name: "address", label: "Adresse", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Mot de passe", type: "password" },
  { name: "confirmPassword", label: "Confirmer le mot de passe", type: "password" },
];

function Register() {
  const { updateConnection } = useAuth();
  const [formData, setFormData] = useState({
    name: 'test', lastname: 'test', phone: '0783173505', address: '12 rue', email: 'test@test.com', password: '123456789', confirmPassword: '123456789'
  });
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = [];
    if (!formData.email.includes('@')) newErrors.push('Email invalide');
    if (formData.password.length < 8) newErrors.push('Le mot de passe doit contenir au moins 8 caractères');
    if (formData.password !== formData.confirmPassword) newErrors.push('Les mots de passe ne correspondent pas');
    if (newErrors.length > 0) { setErrors(newErrors); return; }
    const client = new ApiClient(formData.email, formData.password, "register");
    let res;
    try {
      res = CreateFormData(formData);
      res = await client.register(res);
    } catch (e: any) {
      if(e.hasOwnProperty("response")){
          for (const err in e.response.data) {
          newErrors.push(`${err} : ${e.response.data[err]}`);
        }
        setErrors(newErrors);
      }
      return;
    }

    if (res) {
      await client.connect()
      await updateConnection()
      setErrors([])
      navigate('/account')
    }
  };

  return (
    <Form
      title="Inscription"
      fields={registerFields}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      onSubmit={handleSubmit}
      switchButtons={[
        {
          text: "Déjà un compte? ",
          buttonLabel: "Se connecter",
          onClick: () => navigate(Route.login),
        },
        {
          text: "Mot de passe oublié ? ",
          buttonLabel: "Réinitialiser",
          onClick: () => navigate(Route.resetPassword),
        },
      ]}
      submitLabel="S'inscrire"
    />
  );
}

export default Register;
