import { useState, useEffect } from 'react';

const CreateFolderModal = ({ isOpen, onClose, onCreate }) => {
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    if (isOpen) setFolderName('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderName.trim()) {
      onCreate(folderName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[70] transition-opacity">
      <div className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl transform transition-all scale-100">
        <h2 className="text-xl font-normal text-[#1f1f1f] mb-6">Yeni klasör</h2>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Adsız klasör" 
            autoFocus
            className="w-full border border-gray-300 rounded-md px-4 py-3 mb-8 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-[16px]"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          
          <div className="flex justify-end gap-2">
            <button 
              type="button"
              onClick={onClose} 
              className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-full font-medium transition text-sm"
            >
              İptal
            </button>
            <button 
              type="submit" 
              disabled={!folderName.trim()}
              className="px-6 py-2 bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 transition text-sm disabled:text-gray-300 disabled:hover:bg-transparent"
            >
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;