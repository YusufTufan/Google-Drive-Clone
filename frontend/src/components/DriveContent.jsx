import { useState, useEffect } from 'react';

const DriveContent = ({ 
  folders, 
  files, 
  currentView, 
  currentFolder, 
  onFolderClick, 
  onAction, 
  onMoveItem, 
  onFileDoubleClick, 
  breadcrumbs, 
  onBreadcrumbClick 
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => { setSelectedItems([]); }, [currentFolder, currentView]);

  const formatBytes = (bytes) => {
    if (!+bytes) return '-';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  const handleSelection = (e, id, type) => {
    if (e.target.closest('button')) return;
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
        const exists = selectedItems.find(item => item.id === id && item.type === type);
        if (exists) setSelectedItems(selectedItems.filter(item => !(item.id === id && item.type === type)));
        else setSelectedItems([...selectedItems, { id, type }]);
    } else {
        const exists = selectedItems.find(item => item.id === id && item.type === type);
        if (!exists) setSelectedItems([{ id, type }]);
    }
  };

  const isSelected = (id, type) => selectedItems.some(item => item.id === id && item.type === type);
  
  const handleBackgroundClick = (e) => { 
      if(e.target === e.currentTarget) {
        setSelectedItems([]); 
        setActiveMenu(null); 
      }
  };

  const handleBulkAction = (action) => {
      const confirmMsg = action === 'delete' ? "Seçilenler kalıcı olarak silinecek?" : `${selectedItems.length} öğe için işlem yapılsın mı?`;
      if (window.confirm(confirmMsg)) {
          selectedItems.forEach(item => {
              onAction(action, { id: item.id }, item.type);
          });
          setSelectedItems([]);
      }
  };

  const handleDragStart = (e, item, type) => {
    const isCurrentlySelected = isSelected(item.id, type);
    const itemsToDrag = isCurrentlySelected ? selectedItems : [{id: item.id, type}];
    e.dataTransfer.setData("draggedItems", JSON.stringify(itemsToDrag));
  };
  const handleDragOverItem = (e, folderId) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(folderId); };
  const handleDragLeaveItem = (e) => { e.preventDefault(); setDragOverFolderId(null); };
  const handleDropOnFolder = (e, targetFolderId) => {
    e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null);
    const data = e.dataTransfer.getData("draggedItems");
    if (data) {
        const items = JSON.parse(data);
        items.forEach(i => {
             if (i.id === targetFolderId && i.type === 'folders') return;
             onMoveItem(i.id, i.type, targetFolderId);
        });
    }
  };

  const getFileIcon = (fileName) => {
      if (!fileName) return { color: 'text-gray-400', bg: 'bg-gray-50', icon: null };
      const ext = fileName.split('.').pop().toLowerCase();
      if (['jpg','jpeg','png','gif'].includes(ext)) return { color: 'text-purple-600', bg: 'bg-purple-50', icon: <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg> };
      if (ext === 'pdf') return { color: 'text-red-500', bg: 'bg-red-50', icon: <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg> };
      return { color: 'text-blue-600', bg: 'bg-blue-50', icon: <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg> };
  };

  const ActionMenu = ({ item, type }) => (
    <div className="absolute top-8 right-2 bg-white shadow-xl border border-gray-200 rounded-lg py-1 z-50 w-48 flex flex-col text-left">
       {/* 1. Yeniden Adlandır */}
       <button onClick={(e) => { e.stopPropagation(); onAction('rename', item, type); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2">
           ✏️ Yeniden Adlandır
       </button>
       
       {/* 2. Paylaş */}
       <button onClick={(e) => { e.stopPropagation(); onAction('share', item, type); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2">
           👤 Paylaş
       </button>

       {/* 3. Bağlantıyı Kopyala (Sadece dosyalar için) */}
       {type === 'files' && (
           <button onClick={(e) => { e.stopPropagation(); onAction('getLink', item, type); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2">
               🔗 Bağlantıyı Kopyala
           </button>
       )}

       {/* 4. Yıldızla (EKSİKTİ, GELDİ) */}
       <button onClick={(e) => { e.stopPropagation(); onAction('star', item, type); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2">
           ⭐ {item.is_starred ? 'Yıldızı Kaldır' : 'Yıldızla'}
       </button>

       <div className="border-t my-1"></div>

       {/* 5. Spam Bildir */}
       <button onClick={(e) => { e.stopPropagation(); onAction('spam', item, type); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-500 flex items-center gap-2">
           🚫 Spam Bildir
       </button>

       {/* 6. Çöp Kutusu */}
       <button onClick={(e) => { e.stopPropagation(); onAction('trash', item, type); setActiveMenu(null); }} className="text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600 flex items-center gap-2">
           🗑️ Çöp Kutusu
       </button>
    </div>
  );

  return (
    <div className="w-full pb-10 min-h-screen" onClick={handleBackgroundClick}>
      
      {/* HEADER: TOPLU İŞLEM VEYA NAVİGASYON */}
      {selectedItems.length > 0 ? (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 shadow-sm sticky top-0 z-30">
             <div className="flex items-center gap-3">
                 <button onClick={() => setSelectedItems([])} className="text-gray-500 hover:text-gray-700 font-bold px-2">✕</button>
                 <span className="font-semibold text-blue-800">{selectedItems.length} öğe seçildi</span>
             </div>
             <div className="flex items-center gap-2">
                 <button onClick={() => handleBulkAction('star')} className="p-2 hover:bg-blue-100 rounded text-gray-600" title="Yıldızla">⭐</button>
                 <button onClick={() => handleBulkAction('spam')} className="p-2 hover:bg-gray-200 rounded text-gray-600" title="Spam Bildir">🚫</button> 
                 <button onClick={() => handleBulkAction('trash')} className="p-2 hover:bg-red-100 rounded text-red-600" title="Çöp Kutusuna At">🗑️</button>
             </div>
          </div>
      ) : (
          <div className="flex items-center justify-between mb-6">
             {/* BREADCRUMBS (NAVİGASYON) */}
             <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 overflow-x-auto">
                {breadcrumbs && breadcrumbs.map((crumb, index) => (
                    <div 
                        key={index} 
                        className="flex items-center shrink-0"
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(crumb.id || "ROOT"); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragOverFolderId(null); }}
                        onDrop={(e) => { 
                            e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null); 
                            const data = e.dataTransfer.getData("draggedItems");
                            if(data) {
                                const items = JSON.parse(data);
                                items.forEach(i => onMoveItem(i.id, i.type, crumb.id));
                            }
                        }}
                    >
                        <button 
                            onClick={() => onBreadcrumbClick(index)}
                            className={`hover:bg-gray-200 px-2 py-1 rounded transition 
                                ${index === breadcrumbs.length - 1 ? 'font-bold text-gray-800 cursor-default pointer-events-none' : 'text-gray-500 hover:text-blue-600'}
                                ${dragOverFolderId === (crumb.id || "ROOT") ? 'bg-blue-100 ring-2 ring-blue-400' : ''}
                            `}
                        >
                            {crumb.name}
                        </button>
                        {index < breadcrumbs.length - 1 && <span className="text-gray-400 mx-1">/</span>}
                    </div>
                ))}
             </div>

            <div className="flex bg-gray-100 rounded-lg p-1 ml-auto">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Grid</button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>List</button>
            </div>
          </div>
      )}

      {/* --- GRID GÖRÜNÜMÜ --- */}
      {viewMode === 'grid' && (
          <>
            {/* Klasörler */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                {folders && folders.map(folder => folder ? (
                    <div 
                        key={folder.id} 
                        onClick={(e) => handleSelection(e, folder.id, 'folders')}
                        onDoubleClick={() => onFolderClick(folder)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, folder, 'folders')}
                        onDragOver={(e) => handleDragOverItem(e, folder.id)}
                        onDragLeave={handleDragLeaveItem}
                        onDrop={(e) => handleDropOnFolder(e, folder.id)}
                        className={`relative group flex items-center gap-3 p-3 border rounded-xl cursor-pointer select-none transition-all
                            ${isSelected(folder.id, 'folders') ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' : 'bg-[#F7F9FC] border-gray-200 hover:shadow-sm'}
                            ${dragOverFolderId === folder.id ? 'bg-green-100 border-green-500 scale-105' : ''}
                        `}
                    >
                        <span className="text-xl">📁</span>
                        <span className="text-sm font-medium text-gray-700 truncate">{folder.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === folder.id ? null : folder.id); }} className="ml-auto p-1 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition">⋮</button>
                        {activeMenu === folder.id && <ActionMenu item={folder} type="folders" />}
                    </div>
                ) : null)}
            </div>

            {/* Dosyalar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {files && files.map(file => file ? (
                    <div 
                        key={file.id}
                        onClick={(e) => handleSelection(e, file.id, 'files')}
                        onDoubleClick={() => onFileDoubleClick(file)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file, 'files')}
                        className={`group relative flex flex-col h-[230px] border rounded-xl cursor-pointer select-none transition-all hover:z-50
                             ${isSelected(file.id, 'files') ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg transform scale-[1.02]' : 'border-gray-200 bg-white hover:shadow-md'}
                        `}
                    >
                        <div className="flex-1 bg-[#F0F4F8] flex items-center justify-center overflow-hidden relative rounded-t-xl">
                            {file.thumbnail ? <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover"/> : <div className={getFileIcon(file.name).color}>{getFileIcon(file.name).icon}</div>}
                        </div>
                        <div className="h-[60px] flex items-center px-4 bg-white border-t border-gray-100 relative rounded-b-xl">
                            <span className="text-sm font-medium truncate w-full">{file.name}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === file.id ? null : file.id); }} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition z-20">⋮</button>
                        {activeMenu === file.id && <ActionMenu item={file} type="files" />}
                    </div>
                 ) : null)}
            </div>
          </>
      )}

      {/* --- LIST GÖRÜNÜMÜ --- */}
      {viewMode === 'list' && (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm pb-20">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs border-b">
                        <th className="px-4 py-3">Ad</th>
                        <th className="px-4 py-3">Boyut</th>
                        <th className="px-4 py-3">Tarih</th>
                        <th className="px-4 py-3 w-10"></th>
                    </tr>
                </thead>
                <tbody>
                    {/* KLASÖRLER */}
                    {folders && folders.map(folder => folder ? (
                        <tr 
                            key={folder.id} 
                            onClick={(e) => handleSelection(e, folder.id, 'folders')} 
                            onDoubleClick={() => onFolderClick(folder)}
                            className={`group border-b cursor-pointer transition-colors relative ${isSelected(folder.id, 'folders') ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                        >
                            <td className="px-4 py-3 flex items-center gap-2 font-medium text-gray-700">
                                <span className="text-lg">📁</span> {folder.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatBytes(folder.size)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(folder.created_at)}</td>
                            
                            {/* 3 NOKTA MENÜSÜ */}
                            <td className="px-4 py-3 text-right relative">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === folder.id ? null : folder.id); }} 
                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ⋮
                                </button>
                                {activeMenu === folder.id && (
                                    <div className="absolute right-10 top-2 z-50">
                                        <ActionMenu item={folder} type="folders" />
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : null)}

                    {/* DOSYALAR */}
                    {files && files.map(file => file ? (
                        <tr 
                            key={file.id} 
                            onClick={(e) => handleSelection(e, file.id, 'files')} 
                            onDoubleClick={() => onFileDoubleClick(file)} 
                            className={`group border-b cursor-pointer transition-colors relative ${isSelected(file.id, 'files') ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                        >
                            <td className="px-4 py-3 flex items-center gap-2 text-gray-700">
                                <div className="w-6 h-6 flex items-center justify-center">{getFileIcon(file.name).icon}</div>
                                <span className="truncate max-w-[200px]">{file.name}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatBytes(file.size)}</td>
                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(file.updated_at)}</td>
                            
                            {/* 3 NOKTA MENÜSÜ */}
                            <td className="px-4 py-3 text-right relative">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === file.id ? null : file.id); }} 
                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ⋮
                                </button>
                                {activeMenu === file.id && (
                                    <div className="absolute right-10 top-2 z-50">
                                        <ActionMenu item={file} type="files" />
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : null)}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default DriveContent;