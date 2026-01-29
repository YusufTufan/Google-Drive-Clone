import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.login(username, password);
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      setTimeout(() => {
        navigate('/'); 
      }, 500);
    } catch (error) {
      alert("Giriş yapılamadı! Bilgilerinizi kontrol edin.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Arka plan süsleri (Blurry Circles) */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="bg-white/80 backdrop-blur-lg p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
           <svg viewBox="0 0 87.3 78" className="w-16 h-16 mb-4 drop-shadow-sm hover:scale-105 transition-transform duration-300">
             <path d="M6.6 66.85l25.3-43.8 25.3 43.8H6.6z" fill="#0066DA"/>
             <path d="M43.85 23.05h25.3l12.65 21.9h-25.3l-12.65-21.9z" fill="#00AC47"/>
             <path d="M69.15 44.95H43.85l-12.65 21.9H56.5l12.65-21.9z" fill="#EA4335"/>
             <path d="M43.85 23.05L18.55 66.85 6.6 66.85l37.25-64.5L56.5 23.05H43.85z" fill="#00AC47"/>
             <path d="M69.15 44.95l12.65 21.9-12.1 21-37.9-65.7 12.1-21 25.25 43.8z" fill="#2684FC"/>
             <path d="M31.2 66.85h37.95l12.1 21H6.6l24.6-42.9z" fill="#FFBA00"/>
           </svg>
           <h2 className="text-3xl font-bold text-gray-800">Hoş Geldiniz</h2>
           <p className="text-gray-500 mt-2 text-sm">Drive hesabınıza erişin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Kullanıcı Adı */}
          <div className="group">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">Kullanıcı Adı</label>
            <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </span>
                <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200"
                placeholder="Örn: yusuf"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
            </div>
          </div>

          {/* Şifre */}
          <div className="group">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">Şifre</label>
            <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                </span>
                <input 
                type={showPassword ? "text" : "password"}
                className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                {/* Göster/Gizle İkonu */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none"
                >
                   {showPassword ? (
                       <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.45-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
                   ) : (
                       <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                   )}
                </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                "Giriş Yap"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline hover:text-blue-700 transition">
              Hemen Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;