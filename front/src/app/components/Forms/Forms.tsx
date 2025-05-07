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
                  {field.type === "select" && Array.isArray((field as any).value) ? (
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
                      {(field as any).value.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
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
                  )}
                </div>
              ))}
              <button type="submit" className="submit-btn">{submitLabel}</button>
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
