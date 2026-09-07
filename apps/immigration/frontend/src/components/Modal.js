import React from 'react';

function Modal({ isOpen, onClose, title, children, onSubmit, submitLabel = 'Save' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(); }}>
          <div className="modal-body">{children}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            {onSubmit && <button type="submit" className="btn btn-primary"><i className="fa-solid fa-check"></i> {submitLabel}</button>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
