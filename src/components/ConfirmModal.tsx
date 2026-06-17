'use client';

interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

export default function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
}: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel} id="confirm-modal">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="modal-title">{title}</h3>
        <p className="modal-body">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary btn-sm" onClick={onCancel} id="modal-cancel-btn">
            {cancelLabel}
          </button>
          <button
            className={`btn btn-sm ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            id="modal-confirm-btn"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
