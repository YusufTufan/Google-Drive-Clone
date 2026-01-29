import { useState } from 'react';

const ShareModal = ({ isOpen, onClose, onShare, itemName }) => {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onShare(username);
      setUsername('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80]">
      <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-800">Paylaş</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <p className="text-sm text-gray-500 mb-4">
            <span className="font-semibold text-gray-700">{itemName}</span> öğesini paylaşmak istediğiniz kişinin kullanıcı adını girin.
        </p>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            autoFocus
            placeholder="Kullanıcı Adı (örn: yusuf)"
            className="w-full border border-gray-300 rounded-md p-2 mb-6 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium text-sm">İptal</button>
            <button 
                type="submit" 
                disabled={!username.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 text-sm disabled:opacity-50"
            >
                Tamamlandı
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareModal;