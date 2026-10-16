import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ClearConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Clear Chat History?',
  description = 'This will reset the current conversation messages and citations. Your uploaded research papers, embeddings, and summaries will remain completely safe.',
  confirmText = 'Clear Chat'
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="confirm-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="modal-warn-icon-wrap">
            <AlertTriangle size={20} className="text-warning" />
          </div>
          <h3 className="confirm-modal-title">{title}</h3>
        </div>
        <p className="confirm-modal-desc">{description}</p>
        <div className="confirm-modal-actions">
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-modal-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 size={14} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
