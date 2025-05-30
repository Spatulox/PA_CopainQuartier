import React, { useState } from "react";
import "./Popup.css";

type PopupInfoProps = {
  title: string;
  description: string;
  onClose?: () => void;
  closeLabel?: string;
  children?: React.ReactNode;
};

export function PopupInfo({
  title,
  description,
  onClose,
  closeLabel = "Fermer",
  children,
}: PopupInfoProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    if (onClose) onClose();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="popup-form">
      <div className="popup-info-card">
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button className="close-btn" onClick={handleClose}>
            {closeLabel}
          </button>
        </div>
        <button
          type="button"
          style={{ position: "absolute", top: 10, right: 10 }}
          onClick={handleClose}
          aria-label="Fermer"
        >
          ✖
        </button>
      </div>
    </div>
  );
}