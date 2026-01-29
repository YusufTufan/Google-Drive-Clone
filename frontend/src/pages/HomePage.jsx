import { useEffect, useState } from 'react';
import api from '../services/api';
import DriveContent from '../components/DriveContent';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadModal from '../components/UploadModal'; 
import RenameModal from '../components/RenameModal';
import Sidebar from '../components/Sidebar'; 
import Header from '../components/Header';
import ShareModal from '../components/ShareModal';
import PreviewModal from '../components/PreviewModal';
import Toast from '../components/Toast';
import ProfileModal from '../components/ProfileModal';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  
  const [currentView, setCurrentView] = useState('drive'); 
  const [currentFolder, setCurrentFolder] = useState(null); 
  // Breadcrumbs (Ekmek Kırıntısı) State'i
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: "Drive'ım" }]);
  const [searchQuery, setSearchQuery] = useState('');

  // UI STATE'LERİ
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [droppedFiles, setDroppedFiles] = useState([]); 

  const fetchData = async () => {
    try {
      let folderRes, fileRes;
      if (searchQuery) {
         folderRes = await api.getFolders(null, null, searchQuery);
         fileRes = await api.getFiles(null, null, searchQuery);
      } else if (currentView === 'drive' || (currentView === 'shared' && currentFolder)) {
        folderRes = await api.getFolders(currentFolder);
        fileRes = await api.getFiles(currentFolder);
      } else {
        folderRes = await api.getFolders(null, currentView);
        fileRes = await api.getFiles(null, currentView);
      }
      setFolders(folderRes.data);
      setFiles(fileRes.data);
    } catch (error) { console.error("Veri hatası:", error); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [currentView, currentFolder, searchQuery]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    
    if (files.length > 0) {
        setDroppedFiles(files);
        setIsUploadModalOpen(true);
    }
  };

  // 👇 Navigasyon Fonksiyonları (Breadcrumb)
  const handleFolderClick = (folder) => {
    if (!folder) return;
    if ((currentView === 'drive' || currentView === 'shared') && !searchQuery) {
        setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
        setCurrentFolder(folder.id); 
    }
  };

  const handleBreadcrumbClick = (index) => {
      const newCrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newCrumbs);
      setCurrentFolder(newCrumbs[newCrumbs.length - 1].id);
  };

  const handleCreateFolder = async (name) => {
    try {
      await api.createFolder(name, currentFolder);
      setToast({ message: "Klasör oluşturuldu", type: 'success' });
      fetchData();
    } catch (err) {
      setToast({ message: "Hata oluştu", type: 'error' });
    }
  };

  const handleFileUpload = async (file) => {
    try {
      await api.uploadFile(file, currentFolder);
      fetchData();
    } catch (err) {
      console.error("Yükleme hatası:", err);
      throw err;
    }
  };

  const handleMoveItem = async (itemId, type, targetFolderId) => {
      try {
          let actualTarget = targetFolderId;
          
          if (targetFolderId === "PARENT") {
              if (breadcrumbs.length > 1) {
                  actualTarget = breadcrumbs[breadcrumbs.length - 2].id;
              } else {
                  actualTarget = null;
              }
          }

          await api.move(itemId, type, actualTarget);
          setToast({ message: "Öğe taşındı", type: 'success' });
          fetchData();
      } catch (err) {
          const msg = err.response?.data?.error || "Taşıma başarısız";
          setToast({ message: msg, type: 'error' });
      }
  };

  const handleAction = async (action, item, type) => {
    try {
      if (action === 'rename') { setSelectedItem({ id: item.id, type, name: item.name }); setIsRenameOpen(true); return; }
      if (action === 'share') { setSelectedItem({ id: item.id, type, name: item.name }); setIsShareOpen(true); return; }
      if (action === 'getLink') {
          setToast({ message: "Link alınıyor...", type: 'info' });
          const res = await api.getDownloadLink(item.id);
          await navigator.clipboard.writeText(res.data.url);
          setToast({ message: "Bağlantı kopyalandı! 📋", type: 'success' });
          return;
      }
      if (action === 'star') await api.toggleStar(item.id, type);
      if (action === 'spam') await api.toggleSpam(item.id, type);
      if (action === 'trash') { await api.toggleTrash(item.id, type); setToast({ message: "İşlem başarılı", type: 'success' }); }
      if (action === 'delete') { if (window.confirm("Kalıcı silinecek?")) { await api.deletePermanently(item.id, type); setToast({ message: "Silindi", type: 'error' }); } }
      fetchData(); 
    } catch (error) { setToast({ message: "Hata", type: 'error' }); }
  };

  const handleRenameSubmit = async (newName) => {
      try { await api.rename(selectedItem.id, selectedItem.type, newName); setToast({ message: "Başarılı", type: 'success' }); fetchData(); } catch (err) { setToast({ message: "Hata", type: 'error' }); }
  };
  const handleShareSubmit = async (username) => {
      try { await api.share(selectedItem.id, selectedItem.type, username); setToast({ message: "Paylaşıldı", type: 'success' }); } catch (err) { setToast({ message: "Kullanıcı yok", type: 'error' }); }
  };
  const handlePreview = async (file) => {
      try { const res = await api.getDownloadLink(file.id); setPreviewUrl(res.data.url); setPreviewItem(file); setIsPreviewOpen(true); } catch (err) { setToast({ message: "Hata", type: 'error' }); }
  };

  return (
    <div className="flex h-screen bg-white relative" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragging && <div className="absolute inset-0 bg-blue-500/10 z-[60] border-4 border-blue-500 border-dashed m-4 rounded-3xl flex items-center justify-center pointer-events-none"><div className="bg-blue-600 text-white px-8 py-4 rounded-full text-xl font-bold animate-bounce">Dosyaları Buraya Bırak</div></div>}

      <Sidebar 
        onCreateFolder={() => setIsFolderModalOpen(true)}
        onFileUpload={() => { setDroppedFiles([]); setIsUploadModalOpen(true); }}
        currentView={currentView}
        onChangeView={(view) => { setCurrentView(view); setCurrentFolder(null); setSearchQuery(''); setBreadcrumbs([{ id: null, name: "Drive'ım" }]); }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onSearch={setSearchQuery} onProfileClick={() => setIsProfileOpen(true)} />
        
        <div className="flex-1 overflow-y-auto p-6">
          <DriveContent 
            folders={folders} 
            files={files} 
            currentView={searchQuery ? 'search' : currentView} 
            currentFolder={currentFolder}
            onFolderClick={handleFolderClick}
            breadcrumbs={breadcrumbs}
            onBreadcrumbClick={handleBreadcrumbClick}
            onBackClick={() => {}}
            onAction={handleAction} 
            onMoveItem={handleMoveItem}
            onFileDoubleClick={handlePreview}
          />
        </div>
      </div>

      <CreateFolderModal
       isOpen={isFolderModalOpen}
       onClose={() => setIsFolderModalOpen(false)}
       onCreate={handleCreateFolder}
      />
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => {
            setIsUploadModalOpen(false);
            setDroppedFiles([]);
        }} 
        onUpload={handleFileUpload} 
        initialFiles={droppedFiles}
      />
      
      <RenameModal 
       isOpen={isRenameOpen}
       onClose={() => setIsRenameOpen(false)} 
       onRename={handleRenameSubmit} currentName={selectedItem?.name} 
      />

      <ShareModal 
       isOpen={isShareOpen} 
       onClose={() => setIsShareOpen(false)} 
       onShare={handleShareSubmit} itemName={selectedItem?.name} 
      />

      <PreviewModal 
       isOpen={isPreviewOpen} 
       onClose={() => setIsPreviewOpen(false)} 
       fileUrl={previewUrl} 
       fileName={previewItem?.name} 
      />

      <ProfileModal 
       isOpen={isProfileOpen} 
       onClose={() => setIsProfileOpen(false)} 
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default HomePage;