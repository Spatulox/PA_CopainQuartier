// components/LoginRegister/AuthForm.tsx
import React from "react";
import { FieldForm } from "../Popup/PopupForm";

export type FormDataType = Record<string, string | number | Date | File | null>;

type SwitchButton = {
  text: string; // Texte affiché avant le bouton
  buttonLabel: string; // Texte du bouton
  onClick: () => void; // Action au clic
};

type FormProps<T extends FormDataType> = {
  title: string;
  fields: FieldForm[];
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  errors: string[];
  onSubmit: (e: React.FormEvent) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  switchButtons?: SwitchButton[];
  submitLabel: string;
  children?: React.ReactNode;
};

function valueToString(val: any): string {
  if (val === undefined || val === null) return "";
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return val.toString();
}

function Form<T extends FormDataType>({
  title,
  fields,
  formData,
  setFormData,
  errors,
  onSubmit,
  onClick,
  switchButtons = [],
  submitLabel,
  children,
}: FormProps<T>) {
  function renderField(field: FieldForm) {
    switch (field.type) {
      case "select":
        return (
          <select
            value={valueToString(formData[field.name]) || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
            required={field.required}
            style={field.hide ? { display: "none" } : {}}
            id={field.id}
          >
            <option value="">-- Sélectionner --</option>
            {(field.value || []).map((option) => {
              if (typeof option === "string") {
                // string[]
                return (
                  <option key={option} value={option} onClick={onClick}>
                    {option}
                  </option>
                );
              } else {
                // { value, label }[]
                return (
                  <option
                    key={option.value}
                    value={option.value}
                    onClick={onClick}
                  >
                    {option.label}
                  </option>
                );
              }
            })}
          </select>
        );
      case "textarea":
        return (
          <textarea
            value={valueToString(formData[field.name]) || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
            required={field.required}
            style={field.hide ? { display: "none" } : {}}
            id={field.id}
            onClick={onClick}
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
            required={field.required}
            style={field.hide ? { display: "none" } : {}}
            id={field.id}
            onClick={onClick}
          />
        );
      case "radio":
        return (
          <fieldset style={field.hide ? { display: "none" } : {}} id={field.id}>
            <legend>{field.label}</legend>
            {(field.value || []).map((option) => {
              if (typeof option === "string") {
                // string[]
                return (
                  <label
                    key={option}
                    style={{ marginRight: 10 }}
                    id={option.split(" ").join("")}
                    onClick={onClick}
                  >
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
                      required={field.required}
                      onClick={onClick}
                    />
                    {option}
                  </label>
                );
              } else {
                return (
                  <label
                    key={option.value}
                    style={{ marginRight: 10 }}
                    onClick={onClick}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={option.value}
                      checked={formData[field.name] === option.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      required={field.required}
                      onClick={onClick}
                    />
                    {option.label}
                  </label>
                );
              }
            })}
          </fieldset>
        );

      case "file":
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFormData((prev) => ({
                ...prev,
                [field.name]: file,
              }));
            }}
            required={field.required}
            style={field.hide ? { display: "none" } : {}}
            id={field.id}
            onClick={onClick}
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={valueToString(formData[field.name]) || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [field.name]: e.target.value,
              }))
            }
            required={field.required}
            style={field.hide ? { display: "none" } : {}}
            id={field.id}
            onClick={onClick}
          />
        );
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{title}</h2>
        {errors && errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <p key={index} className="error">
                ⚠️ {error}
              </p>
            ))}
          </div>
        )}
        <form onSubmit={onSubmit}>
          {fields.map((field) => (
            <div className="form-group" key={field.name}>
              <label
                id={field.id + "_label"}
                style={field.hide ? { display: "none" } : {}}
              >
                {field.label}
              </label>
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
}

export default Form;
