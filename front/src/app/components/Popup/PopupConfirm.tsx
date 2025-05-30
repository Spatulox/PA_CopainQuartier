import React, { useEffect, useState } from "react";
import "./Popup.css"

type PopupConfirmProps = {
  title: string;
  description: string;
  errors: any;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  children?: React.ReactNode;
};

export function PopupConfirm({
  title,
  description,
  errors,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  children,
}: PopupConfirmProps) {
  const [open, setOpen] = useState(false);
  const [err, setError] = useState<any | null>(null)

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };

  useEffect(() => {
      if(errors){
          const errTMP: string[] = []
          for (const err in errors){
              errTMP.push(`${err} : ${errors[err]}`)
          }
          if(errTMP.length > 0){
              setError(errTMP)
          }
      }
  }, [errors])

  return (
    <div>
      {(
        <div className="popup-form">
          <div className="popup-confirm-card">
            {err && err.length > 0 && <>
            <div className="error-messages">
              {err && err.length > 0 && err.map((e: any) => (
                  <p>{e}</p>
              ))}
              </div>
            </>}
            <h2>{title}</h2>
            <p>{description}</p>
            {children}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="confirm-btn" onClick={handleConfirm}>{confirmLabel}</button>
              <button className="cancel-btn" onClick={handleCancel}>{cancelLabel}</button>
            </div>
            <button
              type="button"
              style={{ position: "absolute", top: 10, right: 10 }}
              onClick={handleCancel}
              aria-label="Fermer"
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}