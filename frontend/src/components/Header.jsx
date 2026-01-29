import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Header = ({ onSearch, onProfileClick }) => {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.getProfile();
        setUser(res.data);
      } catch (error) { console.error("Kullanıcı bilgisi alınamadı"); }
    };
    fetchUser();
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

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex items-center justify-between w-full py-2 px-4 bg-white sticky top-0 z-40 border-b border-gray-200">
      
      {/* ARAMA KISMI */}
      <div className="flex-1 max-w-3xl mx-auto">
        <div className="flex items-center bg-[#E9EEF6] px-4 h-12 rounded-full focus-within:bg-white focus-within:shadow-md focus-within:ring-1 focus-within:ring-gray-200 transition-all duration-200 ease-in-out">
          <span className="text-gray-500 cursor-pointer p-2">🔍</span>
          <input 
            type="text" 
            placeholder="Drive'da arayın" 
            className="flex-1 bg-transparent border-none outline-none ml-2 text-gray-700 placeholder-gray-500 text-[16px]" 
            onChange={(e) => onSearch(e.target.value)} 
          />
        </div>
      </div>
      
      {/* PROFİL KISMI */}
      <div className="flex items-center gap-2 ml-4 relative" ref={menuRef}>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 bg-purple-600 rounded-full text-white flex items-center justify-center font-medium text-sm cursor-pointer hover:ring-4 ring-gray-100 transition select-none"
        >
          {initial}
        </div>

        {isOpen && (
          <div className="absolute right-0 top-12 bg-white shadow-xl rounded-xl border border-gray-200 w-72 p-1 z-50">
            <div className="px-4 py-4 text-center">
              <div className="w-16 h-16 bg-purple-600 text-white text-3xl flex items-center justify-center rounded-full mx-auto mb-2 font-medium">{initial}</div>
              <p className="text-gray-800 font-medium truncate text-lg">Merhaba, {user?.username}!</p>
              
              <button 
                onClick={() => { 
                    setIsOpen(false);
                    onProfileClick();
                }} 
                className="mt-4 border border-gray-300 rounded-full px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              >
                Hesabınızı yönetin
              </button>
            </div>
            
            <div className="border-t my-1"></div>
            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2">
                Oturumu Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;