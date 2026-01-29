import { useState, useEffect } from 'react';

const RenameModal = ({ isOpen, onClose, onRename, currentName }) => {
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (isOpen) setNewName(currentName || '');
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      onRename(newName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[70]">
      <div className="bg-white rounded-xl p-6 w-96 shadow-2xl">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Yeniden Adlandır</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            autoFocus
            className="w-full border-2 border-blue-500 rounded-md p-2 mb-6 outline-none text-gray-700"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium">İptal</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700">Tamam</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;