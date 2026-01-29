import { useState, useEffect } from 'react';

const UploadModal = ({ isOpen, onClose, onUpload, initialFiles = [] }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (isOpen) {
        if (initialFiles && initialFiles.length > 0) {
            setFiles([...initialFiles]);
        } else {
            setFiles([]);
        }
        setUploading(false);
        setProgress("");
    } else {
        setFiles([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); 

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
      setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1} / ${files.length} dosya yükleniyor...`);
        try {
            await onUpload(files[i]); 
        } catch (error) {
            console.error("Yükleme hatası:", error);
        }
    }

    setUploading(false);
    onClose();
    setFiles([]); 
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Dosya Yükle</h2>
          {!uploading && (
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>

        <div className="p-6">
          {!uploading ? (
            <>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors mb-4">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-4xl mb-2">☁️</span>
                    <p className="text-sm text-gray-500"><span className="font-semibold text-blue-600">Dosya seçin</span> veya sürükleyin</p>
                    <p className="text-xs text-gray-400 mt-1">Çoklu seçim desteklenir</p>
                    </div>
                    <input type="file" className="hidden" multiple onChange={handleFileChange} />
                </label>

                {files.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 text-sm">
                                <span className="truncate max-w-[80%] text-gray-700">📄 {file.name}</span>
                                <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>
                            </div>
                        ))}
                    </div>
                )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium text-gray-700">{progress}</p>
                <p className="text-sm text-gray-500 mt-2">Lütfen pencereyi kapatmayın.</p>
            </div>
          )}
        </div>

        {!uploading && (
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">İptal</button>
            <button 
                onClick={handleSubmit}
                disabled={files.length === 0}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-all shadow-md ${files.length > 0 ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg' : 'bg-gray-300 cursor-not-allowed'}`}
            >
                {files.length > 0 ? `${files.length} Dosyayı Yükle` : 'Yükle'}
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;