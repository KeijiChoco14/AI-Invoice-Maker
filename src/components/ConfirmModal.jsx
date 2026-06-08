function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <div className={`modal-icon ${danger ? "danger" : ""}`}>
          {danger ? "!" : "?"}
        </div>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="modal-actions">
          <button type="button" className="ghost-modal-btn" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            type="button"
            className={danger ? "danger-modal-btn" : "confirm-modal-btn"}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;