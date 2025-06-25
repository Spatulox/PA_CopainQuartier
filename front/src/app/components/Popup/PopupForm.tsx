import React, { useEffect, useState } from "react";
import Form, { FormDataType } from "../Forms/Forms";
import "./Popup.css"

export type FieldForm = {
  id?: string;
  name: string;
  label: string;
  type: "select" | "textarea" | "checkbox" | "radio" | "text" | "email" | "password" | "number" | "date" | "time" | "file" | "tel";
  value?: {value: string, label: string}[] | string[]; 
  required?: boolean;
  hide?:boolean;
};

type PopupFormProps<T extends FormDataType> = {
  title: string;
  fields: FieldForm[];
  APIerrors: any;
  initialFormData: T;
  onSubmit: (formData: T) => Promise<void> | void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
  submitLabel: string;
  buttonLabel?: string;
  children?: React.ReactNode;
};

export function PopupForm<T extends FormDataType>({
  title,
  fields,
  APIerrors,
  initialFormData,
  onSubmit,
  onClick,
  submitLabel,
  buttonLabel = "Ouvrir le formulaire",
  children,
}: PopupFormProps<T>) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<T>(initialFormData);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation simple : vérifie les champs requis
    const errs: string[] = [];
    fields.forEach((field) => {
      const value = formData[field.name];
      if (field.hide) return;
      
      if (field.type === "file") {
        if (field.required !== false && (!value || !(value instanceof File))) {
          errs.push(`Le champ "${field.label}" est obligatoire.`);
        }
        return;
      }

      if (
        field.required !== false &&
        (value === undefined ||
          value === null ||
          (typeof value === "string" && value.trim() === "") ||
          (typeof value === "number" && isNaN(value)))
      ) {
        errs.push(`Le champ "${field.label}" est obligatoire.`);
      }
    });


    setErrors(errs);
    if (errs.length === 0) {
      try {
        await onSubmit(formData);
        setOpen(false);
        setFormData(initialFormData);
        setErrors([]);
      } catch (apiErrors: any) {
        if (Array.isArray(apiErrors)) {
          setErrors(apiErrors);
        } else if (typeof apiErrors === "string") {
          setErrors([apiErrors]);
        } else if (typeof apiErrors === "object" && apiErrors !== null) {
          setErrors(Object.entries(apiErrors).map(([k, v]) => `${k} : ${v}`));
        } else {
          setErrors(["Erreur inconnue"]);
        }
      }
    }
  };

  useEffect(() => {
    if (APIerrors && Array.isArray(APIerrors) && APIerrors.length > 0) {
      setErrors(APIerrors);
    }
  }, [APIerrors]);

  return (
    <div>
      <button onClick={() => setOpen(true)}>{buttonLabel}</button>
      {open && (
        <div className="popup-form">
          <div style={{ position: "relative" }}>
            <Form<T>
              title={title}
              fields={fields}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              onSubmit={handleSubmit}
              onClick={onClick}
              submitLabel={submitLabel}
            >
              <button
                type="button"
                style={{ position: "absolute", top: 10, right: 10 }}
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                ✖
              </button>
              {children}
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}