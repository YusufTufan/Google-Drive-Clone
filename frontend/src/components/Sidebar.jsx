import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const Sidebar = ({ onCreateFolder, onFileUpload, currentView, onChangeView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [storage, setStorage] = useState({ used: 0, total: 15 * 1024 * 1024 * 1024 });
  const menuRef = useRef(null);

  const fetchStorage = async () => {
    try {
      const res = await api.getStorageUsage();
      setStorage(res.data);
    } catch (err) {
      console.error("Depolama bilgisi alınamadı");
    }
  };

  useEffect(() => {
    fetchStorage();
    
    const interval = setInterval(fetchStorage, 10000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercent = Math.min((storage.used / storage.total) * 100, 100);

  const MenuItem = ({ id, icon, label }) => (
    <div 
      onClick={() => onChangeView(id)}
      className={`flex items-center gap-4 px-4 py-2 rounded-r-full cursor-pointer text-sm transition-colors mb-1 select-none
        ${currentView === id 
          ? 'bg-[#C2E7FF] text-[#001D35] font-medium' 
          : 'text-[#444746] hover:bg-gray-100' 
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="w-[256px] p-4 hidden md:flex flex-col h-full bg-white shrink-0 pt-2"> 
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6 pl-3 cursor-pointer" onClick={() => onChangeView('drive')}>
        <svg viewBox="0 0 87.3 78" className="w-9 h-9">
          <path d="M6.6 66.85l25.3-43.8 25.3 43.8H6.6z" fill="#0066DA"/>
          <path d="M43.85 23.05h25.3l12.65 21.9h-25.3l-12.65-21.9z" fill="#00AC47"/>
          <path d="M69.15 44.95H43.85l-12.65 21.9H56.5l12.65-21.9z" fill="#EA4335"/>
          <path d="M43.85 23.05L18.55 66.85 6.6 66.85l37.25-64.5L56.5 23.05H43.85z" fill="#00AC47"/>
          <path d="M69.15 44.95l12.65 21.9-12.1 21-37.9-65.7 12.1-21 25.25 43.8z" fill="#2684FC"/>
          <path d="M31.2 66.85h37.95l12.1 21H6.6l24.6-42.9z" fill="#FFBA00"/>
        </svg>
        <span className="text-[22px] text-[#444746] font-normal tracking-tight ml-1">Drive</span>
      </div>

      {/* + Yeni Butonu */}
      <div className="relative mb-6 pl-1" ref={menuRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-white border border-transparent shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] rounded-2xl p-4 w-[120px] hover:bg-[#F0F4F8] hover:shadow-lg transition-all cursor-pointer h-14"
        >
          <svg viewBox="0 0 24 24" className="w-8 h-8"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#1f1f1f"/></svg>
          <span className="font-medium text-[#444746] text-sm">Yeni</span>
        </button>

        {isOpen && (
          <div className="absolute top-16 left-0 bg-white shadow-xl rounded-lg py-2 w-56 border border-gray-100 z-50">
            <div 
              onClick={() => { onCreateFolder(); setIsOpen(false); }}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-gray-500">📁</span> <span className="text-sm">Yeni Klasör</span>
            </div>
            <div className="border-t my-1"></div>
            <div 
              onClick={() => { onFileUpload(); setIsOpen(false); }}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-gray-500">📄</span> <span className="text-sm">Dosya Yükleme</span>
            </div>
          </div>
        )}
      </div>

      {/* Menü Linkleri */}
      <nav className="flex flex-col pr-3">
        <MenuItem id="drive" icon="📂" label="Drive'ım" />
        <MenuItem id="shared" icon="👥" label="Benimle paylaşılanlar" />
        <MenuItem id="recent" icon="🕒" label="En son" />
        <MenuItem id="starred" icon="⭐" label="Yıldızlı" />
        <MenuItem id="spam" icon="🛑" label="Spam" />
        <MenuItem id="trash" icon="🗑️" label="Çöp Kutusu" />
      </nav>
      
      {/* Depolama Alanı (DİNAMİK HESAPLAMA) */}
      <div className="mt-auto mb-4 px-4 text-xs text-gray-500">
         <div className="flex items-center gap-2 mb-1">
             <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-gray-600"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/></svg>
             <span className="text-sm text-gray-700">Depolama alanı</span>
         </div>
         
         {/* İlerleme Çubuğu */}
         <div className="w-full bg-gray-200 h-1 rounded-full mb-2 overflow-hidden">
            <div 
                className={`h-1 rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${usagePercent}%` }}
            ></div>
         </div>
         
         <p>{formatSize(storage.used)} / {formatSize(storage.total)} kullanılıyor</p>
         
         <button className="mt-3 text-blue-600 border border-gray-300 rounded-full px-4 py-1.5 w-full text-sm font-medium hover:bg-blue-50 transition">
             Daha fazla depolama alanı al
         </button>
      </div>
    </div>
  );
};

export default Sidebar;