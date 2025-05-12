// components/LoginRegister/AuthForm.tsx
import React from "react";

type Field = {
  name: string;
  label: string;
  type: string;
  value?: string[]
  required?: boolean;
};

type SwitchButton = {
    text: string;           // Texte affiché avant le bouton
    buttonLabel: string;    // Texte du bouton
    onClick: () => void;    // Action au clic
  };

type FormProps<T extends Record<string, string>> = {
    title: string;
    fields: Field[];
    formData: T;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    errors: string[];
    onSubmit: (e: React.FormEvent) => void;
    switchButtons?: SwitchButton[];
    submitLabel: string;
    children?: React.ReactNode;
};
  


function Form<T extends Record<string, string>>({
    title,fields,formData,
    setFormData,errors,
    onSubmit,
    switchButtons = [],
    submitLabel, children
}: FormProps<T>) {

    function renderField(field: Field) {
      switch (field.type) {
        case "select":
          return (
            <select
              value={formData[field.name] || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              required={field.required !== false}
            >
              <option value="">-- Sélectionner --</option>
              {(field.value || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        case "textarea":
          return (
            <textarea
              value={formData[field.name] || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              required={field.required !== false}
            />
          );
        case "checkbox":
          return (
            <input
              type="checkbox"
              checked={!!formData[field.name]}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [field.name]: e.target.checked ? "true" : "",
                }))
              }
              required={field.required !== false}
            />
          );
        case "radio":
          return (
            <fieldset>
              <legend>{field.label}</legend>
              {(field.value || []).map((option) => (
                <label key={option} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={field.name}
                    value={option}
                    checked={formData[field.name] === option}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [field.name]: e.target.value,
                      }))
                    }
                    required={field.required !== false}
                  />
                  {option}
                </label>
              ))}
            </fieldset>
          );
        // Ajoute ici d'autres types personnalisés si besoin
        default:
          return (
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
          );
      }
    }


    return (
        <div className="auth-container">
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
                  {renderField(field)}
                </div>
              ))}
              <button type="submit" className="submit-btn">
                {submitLabel}
              </button>
            </form>
            {children}
            {switchButtons.length > 0 && (
              <div className="switch-mode">
                {switchButtons.map((btn, idx) => (
                  <p key={idx}>
                    {btn.text}
                    <button
                      type="button"
                      className="link-btn"
                      onClick={btn.onClick}
                    >
                      {btn.buttonLabel}
                    </button>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      );
};

export default Form;
