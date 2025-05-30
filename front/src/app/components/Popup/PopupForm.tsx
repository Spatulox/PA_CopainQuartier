import React, { useState } from "react";
import Form from "../Forms/Forms";
import "./Popup.css"

export type FieldForm = {
  name: string;
  label: string;
  type: string;
  value?: {value: string, label: string}[] | string[]; 
  required?: boolean;
};

type PopupFormProps<T extends Record<string, string>> = {
  title: string;
  fields: FieldForm[];
  APIerrors: any;
  initialFormData: T;
  onSubmit: (formData: T) => Promise<void> | void;
  submitLabel: string;
  buttonLabel?: string;
  children?: React.ReactNode;
};

export function PopupForm<T extends Record<string, string>>({
  title,
  fields,
  APIerrors,
  initialFormData,
  onSubmit,
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
      if ((field.required !== false) && !formData[field.name]?.trim()) {
        errs.push(`Le champ "${field.label}" est obligatoire.`);
      }
    });

    const APIerrs: string[] = [];
    if(APIerrors){
      for (const key in APIerrors){
        APIerrs.push(`${key} : ${APIerrors[key]}`)
      }
      if(APIerrs.length > 0){
        setErrors(APIerrs)
        return
      }
    }

    setErrors(errs);
    if (errs.length === 0) {
      await onSubmit(formData);
      setOpen(false);
      setFormData(initialFormData);
      setErrors([]);
    }
  };

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