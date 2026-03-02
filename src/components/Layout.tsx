import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import ChatWidget from './ChatWidget';
import AdminEditButton from './AdminEditButton';
import { api } from '../services/api';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api('/api/settings').then(setSettings).catch(console.error);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans" dir="rtl">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-900 tracking-tight">
                إنترماكس
              </Link>
            </div>
            
            <nav className="hidden md:flex gap-8">
              {isHome ? (
                <>
                  <a href="#home" className="text-slate-600 hover:text-indigo-600 font-medium">الرئيسية</a>
                  <a href="#about" className="text-slate-600 hover:text-indigo-600 font-medium">من نحن</a>
                  <a href="#sectors" className="text-slate-600 hover:text-indigo-600 font-medium">القطاعات</a>
                  <a href="#contact" className="text-slate-600 hover:text-indigo-600 font-medium">تواصل معنا</a>
                </>
              ) : (
                <>
                  <Link to="/#home" className="text-slate-600 hover:text-indigo-600 font-medium">الرئيسية</Link>
                  <Link to="/#about" className="text-slate-600 hover:text-indigo-600 font-medium">من نحن</Link>
                  <Link to="/#sectors" className="text-slate-600 hover:text-indigo-600 font-medium">القطاعات</Link>
                  <Link to="/#contact" className="text-slate-600 hover:text-indigo-600 font-medium">تواصل معنا</Link>
                </>
              )}
            </nav>

            <div className="hidden md:flex items-center space-x-4 space-x-reverse">
              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-slate-600 hover:text-indigo-600 font-medium">لوحة التحكم</Link>
                  )}
                  <Link to="/profile" className="flex items-center space-x-2 space-x-reverse text-slate-600 hover:text-indigo-600">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  تسجيل الدخول
                </Link>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-4 space-y-1">
            {isHome ? (
              <>
                <a href="#home" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">الرئيسية</a>
                <a href="#about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">من نحن</a>
                <a href="#sectors" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">القطاعات</a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">تواصل معنا</a>
              </>
            ) : (
              <>
                <Link to="/#home" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">الرئيسية</Link>
                <Link to="/#about" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">من نحن</Link>
                <Link to="/#sectors" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">القطاعات</Link>
                <Link to="/#contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">تواصل معنا</Link>
              </>
            )}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">لوحة التحكم</Link>
                )}
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50">الملف الشخصي</Link>
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-right px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">تسجيل الخروج</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-50">تسجيل الدخول</Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <ChatWidget />
      <AdminEditButton />

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">إنترماكس</h3>
            <p className="text-sm leading-relaxed">
              {settings.footer_about || 'شركة إنترماكس للتوكيلات التجارية، تأسست عام 2025 في جمهورية مصر العربية، لتقديم حلول متكاملة ومتميزة في مجال التوريدات العامة.'}
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              {isHome ? (
                <>
                  <li><a href="#home" className="hover:text-white transition-colors">الرئيسية</a></li>
                  <li><a href="#about" className="hover:text-white transition-colors">من نحن</a></li>
                  <li><a href="#sectors" className="hover:text-white transition-colors">القطاعات</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">تواصل معنا</a></li>
                </>
              ) : (
                <>
                  <li><Link to="/#home" className="hover:text-white transition-colors">الرئيسية</Link></li>
                  <li><Link to="/#about" className="hover:text-white transition-colors">من نحن</Link></li>
                  <li><Link to="/#sectors" className="hover:text-white transition-colors">القطاعات</Link></li>
                  <li><Link to="/#contact" className="hover:text-white transition-colors">تواصل معنا</Link></li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li>الهاتف: <a href={`tel:${settings.contact_phone || '01116922271'}`} className="hover:text-indigo-400 transition-colors" dir="ltr">{settings.contact_phone || '01116922271'}</a></li>
              <li>البريد الإلكتروني: <a href={`mailto:${settings.contact_email || 'intermax@intermax-info.com'}`} className="hover:text-indigo-400 transition-colors">{settings.contact_email || 'intermax@intermax-info.com'}</a></li>
              <li>العنوان: {settings.contact_address || '٤٠ شارع شريف تقاطع راغب حلوان'}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} إنترماكس للتوكيلات التجارية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
