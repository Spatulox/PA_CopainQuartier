import React, { useState } from "react";

type PopupConfirmProps = {
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  buttonLabel?: string;
  children?: React.ReactNode;
};

export function PopupConfirm({
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  buttonLabel = "Ouvrir la confirmation",
  children,
}: PopupConfirmProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    await onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    setOpen(false);
  };

  return (
    <div>
      {(
        <div className="popup-form">
          <div className="popup-confirm-card" style={{ position: "relative", minWidth: 300, background: "#fff", borderRadius: 8, padding: 24 }}>
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