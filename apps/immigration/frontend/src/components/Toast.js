import React, { useEffect } from 'react';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };

  return (
    <div className={`toast toast-${type}`}>
      <i className={`fa-solid ${icons[type]}`}></i>
      {message}
    </div>
  );
}

export default Toast;
