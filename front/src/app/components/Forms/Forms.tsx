// components/LoginRegister/AuthForm.tsx
import React from "react";

type Field = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
};

type FormProps<T extends Record<string, string>> = {
    title: string;
    fields: Field[];
    formData: T;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    errors: string[];
    onSubmit: (e: React.FormEvent) => void;
    switchText: string;
    onSwitch: () => void;
    submitLabel: string;
};
  


function Form<T extends Record<string, string>>({
    title,fields,formData,
    setFormData,errors,
    onSubmit,switchText,
    onSwitch,submitLabel,
}: FormProps<T>) {
  return <div className="auth-container">
    <div className="auth-card">
      <h2>{title}</h2>
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <p key={index} className="error">⚠️ {error}</p>
          ))}
        </div>
      )}
      <form onSubmit={onSubmit}>
        {fields.map((field) => (
          <div className="form-group" key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type}
              value={formData[field.name] || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              required={field.required !== false}
            />
          </div>
        ))}
        <button type="submit" className="submit-btn">{submitLabel}</button>
      </form>
      <div className="switch-mode">
        <p>
          {switchText}
          <button type="button" className="link-btn" onClick={onSwitch}>
            {title === "Connexion" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  </div>
};

export default Form;
