import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const bgColors = {
    success: 'bg-[#1e1e1e] text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  return (
    <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-[100] animate-bounce-in ${bgColors[type]}`}>
      <span className="text-xl">{type === 'success' ? '✅' : 'ℹ️'}</span>
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/60 hover:text-white">✕</button>
    </div>
  );
};

export default Toast;