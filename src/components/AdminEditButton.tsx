import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Edit3, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function AdminEditButton() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'admin') return null;

  const handleOpen = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const data = await api('/api/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('تم حفظ التعديلات بنجاح. سيتم تحديث الصفحة.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="fixed bottom-6 left-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
      >
        <Edit3 className="w-6 h-6" />
        <span className="font-bold hidden sm:inline">تعديل محتوى الموقع</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4" dir="rtl">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-6 h-6 text-indigo-600" />
                  تعديل نصوص الموقع مباشرة
                </h2>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-indigo-600 bg-indigo-50 p-3 rounded-xl">الرئيسية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">العنوان الرئيسي</label>
                        <input type="text" value={settings.home_title || ''} onChange={e => setSettings({...settings, home_title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">العنوان الفرعي</label>
                        <input type="text" value={settings.home_subtitle || ''} onChange={e => setSettings({...settings, home_subtitle: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">الوصف</label>
                        <textarea rows={2} value={settings.home_description || ''} onChange={e => setSettings({...settings, home_description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-indigo-600 bg-indigo-50 p-3 rounded-xl">من نحن</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">العنوان</label>
                        <input type="text" value={settings.about_title || ''} onChange={e => setSettings({...settings, about_title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">الوصف الرئيسي</label>
                        <textarea rows={2} value={settings.about_description || ''} onChange={e => setSettings({...settings, about_description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">رؤيتنا</label>
                        <textarea rows={2} value={settings.about_vision || ''} onChange={e => setSettings({...settings, about_vision: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">التطوير المستمر</label>
                        <textarea rows={2} value={settings.about_development || ''} onChange={e => setSettings({...settings, about_development: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">فريق العمل</label>
                        <textarea rows={2} value={settings.about_team || ''} onChange={e => setSettings({...settings, about_team: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">الجودة</label>
                        <textarea rows={2} value={settings.about_quality || ''} onChange={e => setSettings({...settings, about_quality: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-indigo-600 bg-indigo-50 p-3 rounded-xl">القطاعات وتواصل معنا</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">عنوان القطاعات</label>
                        <input type="text" value={settings.sectors_title || ''} onChange={e => setSettings({...settings, sectors_title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">وصف القطاعات</label>
                        <input type="text" value={settings.sectors_subtitle || ''} onChange={e => setSettings({...settings, sectors_subtitle: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">عنوان تواصل معنا</label>
                        <input type="text" value={settings.contact_title || ''} onChange={e => setSettings({...settings, contact_title: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
                        <input type="text" value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                      </div>
                    </div>
                  </div>

                  <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-8 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100">
                      إلغاء
                    </button>
                    <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      حفظ التعديلات
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
