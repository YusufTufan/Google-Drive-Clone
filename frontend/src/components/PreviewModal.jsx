const PreviewModal = ({ isOpen, onClose, fileUrl, fileName }) => {
  if (!isOpen || !fileUrl) return null;

  const safeName = fileName || "Dosya";
  const ext = safeName.split('.').pop().toLowerCase();
  

  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  const isPDF = ext === 'pdf';


  const handleForceDownload = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = safeName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
        console.error("İndirme hatası:", error);
        window.open(fileUrl, '_blank');
    }
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      
      {/* Kapat Butonu */}
      <button onClick={onClose} className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition z-[110]">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>

      {/* Başlık */}
      <div className="absolute top-5 left-5 text-white font-medium text-lg flex items-center gap-2 z-[110]">
         <span className="opacity-70">Dosya:</span> {safeName}
      </div>

      <div className="w-full h-full flex items-center justify-center">
        {/* RESİM */}
        {isImage && <img src={fileUrl} alt={safeName} className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"/>}

        {/* PDF */}
        {isPDF && <iframe src={fileUrl} title={safeName} className="w-[85%] h-[90%] bg-white rounded-lg shadow-2xl"/>}

        {/* DİĞER (JS, Python, Zip...) */}
        {!isImage && !isPDF && (
            <div className="bg-white p-10 rounded-2xl text-center shadow-2xl max-w-sm w-full relative z-[120]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📄</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Önizleme Yok</h3>
                <p className="text-gray-500 mb-6 text-sm">Bu dosya türü ({ext.toUpperCase()}) tarayıcıda açılamıyor.</p>
                
                {/* İNDİRME BUTONU -  fonksiyona bağlı */}
                <button 
                    onClick={handleForceDownload}
                    className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg cursor-pointer"
                >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    Dosyayı İndir
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PreviewModal;