import React from 'react';

function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Delete', message = 'Are you sure you want to delete this item? This action cannot be undone.' }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 40, color: '#ef4444', marginBottom: 16 }}></i>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}><i className="fa-solid fa-trash"></i> Delete</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
