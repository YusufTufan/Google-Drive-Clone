import { useState, useEffect } from 'react';
import api from '../services/api';

const ProfileModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState({ username: '', first_name: '', last_name: '', email: '' });
  
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
        fetchProfile();
        setMessage(null);
        setPasswords({ old: '', new: '', confirm: '' });
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
        const res = await api.getProfile();
        setUser(res.data);
    } catch (err) {
        console.error("Profil alınamadı");
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: 'info', text: 'Kaydediliyor...' });
    try {
        await api.updateProfile(user);
        setMessage({ type: 'success', text: 'Profil güncellendi! ✅' });
    } catch (err) {
        setMessage({ type: 'error', text: 'Güncelleme başarısız.' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
        setMessage({ type: 'error', text: 'Yeni şifreler uyuşmuyor!' });
        return;
    }
    setMessage({ type: 'info', text: 'İşleniyor...' });
    try {
        await api.changePassword(passwords.old, passwords.new);
        setMessage({ type: 'success', text: 'Şifre başarıyla değiştirildi! 🔒' });
        setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.error || 'Hata oluştu. Eski şifreyi kontrol edin.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90]">
      <div className="bg-white rounded-xl w-96 shadow-2xl overflow-hidden">
        
        {/* Başlık */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-gray-700">Hesap Ayarları</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Sekmeler */}
        <div className="flex border-b">
            <button 
                onClick={() => { setActiveTab('info'); setMessage(null); }}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Bilgilerim
            </button>
            <button 
                onClick={() => { setActiveTab('security'); setMessage(null); }}
                className={`flex-1 py-3 text-sm font-medium ${activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Güvenlik
            </button>
        </div>

        {/* İçerik */}
        <div className="p-6">
            {message && (
                <div className={`mb-4 p-2 text-sm rounded ${message.type === 'error' ? 'bg-red-50 text-red-600' : message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {message.text}
                </div>
            )}

            {/* --- SEKME 1: BİLGİLER --- */}
            {activeTab === 'info' && (
                <form onSubmit={handleInfoSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kullanıcı Adı</label>
                        <input type="text" value={user.username} disabled className="w-full bg-gray-100 border rounded px-3 py-2 text-gray-500 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Ad</label>
                            <input type="text" value={user.first_name} onChange={e => setUser({...user, first_name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Soyad</label>
                            <input type="text" value={user.last_name} onChange={e => setUser({...user, last_name: e.target.value})} className="w-full border rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">E-posta</label>
                        <input type="email" value={user.email} onChange={e => setUser({...user, email: e.target.value})} className="w-full border rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium text-sm hover:bg-blue-700 mt-2">Güncelle</button>
                </form>
            )}

            {/* --- SEKME 2: GÜVENLİK --- */}
            {activeTab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Mevcut Şifre</label>
                        <input type="password" required value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} className="w-full border rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Yeni Şifre</label>
                        <input type="password" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full border rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Yeni Şifre (Tekrar)</label>
                        <input type="password" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full border rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <button type="submit" className="w-full bg-red-500 text-white py-2 rounded font-medium text-sm hover:bg-red-600 mt-2">Şifreyi Değiştir</button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;