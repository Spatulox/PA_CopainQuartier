import { useEffect, useState } from 'react';
import '../Forms/Form.css';
import { ApiClient } from '../../../api/client';
import { useNavigate } from 'react-router-dom';
import Form from '../Forms/Forms';
import { Route } from '../../constantes';
import { FieldForm } from '../Popup/PopupForm';

const resetFields: FieldForm[] = [
  { name: "email", label: "Email", type: "email" },
];

const resetCodeFields: FieldForm[] = [
  { name: "id", label: "Code", type: "number" },
  { name: "password", label: "Mot de Passe", type: "password" },
];

function ResetPassword() {
  const [formData, setFormData] = useState({ email: '' });
  const [formDataCode, setFormDataCode] = useState({ id: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [errorscode, setErrorsCode] = useState<string[]>([]);
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
      await client.resetPassword(formData.email);
      setSuccess("Si un compte existe avec cet email, un message de réinitialisation a été envoyé.");
      //setFormData({ email: '' });
    } catch (e: any) {
      setSuccess(null);
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

  async function createNewPassword(e: React.FormEvent){
    e.preventDefault();
    const client = new ApiClient()
    try {
      const option = {
        email : formData.email,
        id: formDataCode.id,
        password : formDataCode.password
      }
      await client.resetPasswordCode(option)
      setErrors([])
      setErrorsCode([])
      navigate(Route.login)
    } catch (e) {
      console.error(e)
      setErrorsCode(client.errors)
    }
  }

  useEffect(() => {
    console.log(success)
  }, [success])
  return (<>
    { !success && (<Form
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
      submitLabel={loading ? "Envoi..." : "Envoyer le code"}
    >
      {success && <div className="success-messages"><p className="success">{success}</p></div>}
    </Form>
    )}
    { success && (
      <Form
        title='Code de réinitialisation'
        fields={resetCodeFields}
        formData={formDataCode}
        setFormData={setFormDataCode}
        errors={errorscode}
        onSubmit={createNewPassword}
        submitLabel='Réinitialiser le mot de passe'
        switchButtons={[
          {
            text: "",
            buttonLabel: "Renvoyer un code ?",
            onClick: () => setSuccess(null),
          }
        ]}
      />
    )}
    </>
  );
}

export default ResetPassword;