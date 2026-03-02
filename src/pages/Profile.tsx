import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { motion } from 'motion/react';
import { Camera, Save } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState(user?.avatar || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    if (password) formData.append('password', password);
    if (avatar) formData.append('avatar', avatar);

    try {
      const data = await api('/api/profile', {
        method: 'PUT',
        body: formData,
      });
      updateUser(data.user);
      setMessage('تم تحديث الملف الشخصي بنجاح');
      setPassword('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="bg-indigo-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-8 flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl font-bold">
                      {name.charAt(0)}
                    </div>
                  )}
                </div>
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-full">
                {user.role === 'admin' ? 'مدير النظام' : 'عميل'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              {message && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm text-center">{message}</div>}
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الجديدة (اختياري)</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="اتركه فارغاً إذا لم ترغب بتغييره"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
