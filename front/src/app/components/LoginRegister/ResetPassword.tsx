import { useState } from 'react';
import '../Forms/form.css';
import { ApiClient } from '../../../api/client';
import { useNavigate } from 'react-router-dom';
import Form from '../Forms/Forms';
import { Route } from '../../constantes';

const resetFields = [
  { name: "email", label: "Email", type: "email" },
];

function ResetPassword() {
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(null);

    const newErrors = [];
    if (!formData.email.includes('@')) newErrors.push('Email invalide');
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const client = new ApiClient();
      await client.resetPassword({ email: formData.email });
      setSuccess("Si un compte existe avec cet email, un message de réinitialisation a été envoyé.");
      setFormData({ email: '' });
    } catch (e: any) {
      if (e.response?.data) {
        for (const err in e.response.data) {
          newErrors.push(`${err !== "message" ? err + " : " : ""}${e.response.data[err]}`);
        }
      } else {
        newErrors.push("Erreur lors de la demande de réinitialisation.");
      }
      setErrors(newErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      title="Réinitialiser le mot de passe"
      fields={resetFields}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      onSubmit={handleSubmit}
      switchButtons={[
        {
          text: "Déjà un compte ? ",
          buttonLabel: "Se connecter",
          onClick: () => navigate(Route.login),
        },
        {
          text: "Pas encore de compte ? ",
          buttonLabel: "Créer un compte",
          onClick: () => navigate(Route.register),
        },
      ]}
      submitLabel={loading ? "Envoi..." : "Envoyer le lien"}
    >
      {success && <div className="success-messages"><p className="success">{success}</p></div>}
    </Form>
  );
}

export default ResetPassword;