import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, MessageCircle, Users, LayoutDashboard, Eye, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

interface Section {
  id: number;
  title: string;
  description: string;
  image: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

interface Visit {
  id: number;
  ip: string;
  user_agent: string;
  page: string;
  timestamp: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: 'new' | 'read' | 'archived';
  timestamp: string;
}

export default function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'sections' | 'users' | 'settings' | 'visits' | 'contact'>('sections');
  const [sections, setSections] = useState<Section[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [visits, setVisits] = useState<Visit[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);

  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', image: null as File | null });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sectionsData, usersData, settingsData, visitsData, contactData] = await Promise.all([
        api('/api/sections'),
        api('/api/chat/users'),
        api('/api/settings'),
        api('/api/visits'),
        api('/api/contact')
      ]);
      setSections(sectionsData);
      setUsers(usersData);
      setSettings(settingsData);
      setVisits(visitsData.visits);
      setTotalVisits(visitsData.total);
      setContactMessages(contactData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();

    const newSocket = io(import.meta.env.VITE_API_URL || '');

    newSocket.on('connect', () => {
      newSocket.emit('join', { userId: user.id, role: user.role });
    });

    newSocket.on('newUser', (newUser: User) => {
      setUsers(prev => [newUser, ...prev]);
    });

    newSocket.on('newMessage', () => {
      // Refresh users list if needed, or just show a notification
      // For now, we can just fetch users to ensure the list is up to date
      api('/api/chat/users').then(setUsers);
    });

    newSocket.on('newContactMessage', (newMessage: ContactMessage) => {
      setContactMessages(prev => [newMessage, ...prev]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user, navigate]);

  const handleOpenModal = (section?: Section) => {
    if (section) {
      setEditingSection(section);
      setFormData({ title: section.title, description: section.description, image: null });
    } else {
      setEditingSection(null);
      setFormData({ title: '', description: '', image: null });
    }
    setIsModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    if (formData.image) data.append('image', formData.image);

    try {
      if (editingSection) {
        await api(`/api/sections/${editingSection.id}`, { method: 'PUT', body: data });
      } else {
        await api('/api/sections', { method: 'POST', body: data });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save section', error);
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;
    try {
      await api(`/api/sections/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Failed to delete section', error);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const handleUpdateContactStatus = async (id: number, status: string) => {
    try {
      await api(`/api/contact/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setContactMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status: status as any } : msg));
    } catch (error) {
      console.error('Failed to update message status', error);
    }
  };

  const handleDeleteContactMessage = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      await api(`/api/contact/${id}`, { method: 'DELETE' });
      setContactMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error('Failed to delete message', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-indigo-600" />
            لوحة التحكم
          </h1>
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex-wrap">
            <button
              onClick={() => setActiveTab('sections')}
              className={"px-6 py-2 rounded-lg font-medium transition-colors " + (activeTab === 'sections' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              إدارة القطاعات
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={"px-6 py-2 rounded-lg font-medium transition-colors " + (activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              المستخدمين والمحادثات
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={"px-6 py-2 rounded-lg font-medium transition-colors relative " + (activeTab === 'contact' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              رسائل التواصل
              {contactMessages.filter(m => m.status === 'new').length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {contactMessages.filter(m => m.status === 'new').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={"px-6 py-2 rounded-lg font-medium transition-colors " + (activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              إعدادات الموقع
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={"px-6 py-2 rounded-lg font-medium transition-colors " + (activeTab === 'visits' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50')}
            >
              الزيارات
            </button>
          </div>
        </div>

        {activeTab === 'visits' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Eye className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">إجمالي الزيارات</h2>
                  <p className="text-3xl font-black text-indigo-600 mt-1">{totalVisits}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">أحدث الزيارات</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-slate-600 font-semibold">التاريخ والوقت</th>
                      <th className="px-6 py-4 text-slate-600 font-semibold">الصفحة</th>
                      <th className="px-6 py-4 text-slate-600 font-semibold">IP</th>
                      <th className="px-6 py-4 text-slate-600 font-semibold">المتصفح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.map(visit => (
                      <tr key={visit.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-900" dir="ltr">
                          {new Date(visit.timestamp).toLocaleString('ar-EG')}
                        </td>
                        <td className="px-6 py-4 text-slate-900" dir="ltr">{visit.page}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-sm">{visit.ip}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate" title={visit.user_agent}>{visit.user_agent}</td>
                      </tr>
                    ))}
                    {visits.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">لا توجد زيارات مسجلة بعد</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sections' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => handleOpenModal()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة قسم جديد
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-slate-600 font-semibold">القسم</th>
                    <th className="px-6 py-4 text-slate-600 font-semibold">الوصف</th>
                    <th className="px-6 py-4 text-slate-600 font-semibold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sections.map(section => (
                    <tr key={section.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{section.title}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-md truncate">{section.description}</td>
                      <td className="px-6 py-4 flex justify-center gap-3">
                        <button onClick={() => handleOpenModal(section)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-lg">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteSection(section.id)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-lg">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(u => (
              <div key={u.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-indigo-50 rounded-full overflow-hidden flex-shrink-0 border-2 border-indigo-100">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-600 text-xl font-bold">{u.name.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-grow text-center sm:text-right">
                  <h3 className="font-bold text-slate-900 text-lg">{u.name}</h3>
                  <p className="text-sm text-slate-500 truncate" dir="ltr">{u.email}</p>
                </div>
                <button onClick={() => navigate(`/chat?user=${u.id}`)} className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium mt-4 sm:mt-0">
                  <MessageCircle className="w-5 h-5" />
                  <span>مراسلة</span>
                </button>
              </div>
            ))}
            {users.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                لا يوجد مستخدمين حالياً
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  رسائل تواصل معنا
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {contactMessages.map(msg => (
                  <div key={msg.id} className={`p-6 transition-colors ${msg.status === 'new' ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          {msg.name}
                          {msg.status === 'new' && (
                            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">جديد</span>
                          )}
                        </h4>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                          <a href={`mailto:${msg.email}`} className="hover:text-indigo-600 transition-colors" dir="ltr">{msg.email}</a>
                          {msg.phone && (
                            <a href={`tel:${msg.phone}`} className="hover:text-indigo-600 transition-colors" dir="ltr">{msg.phone}</a>
                          )}
                          <span className="text-slate-400" dir="ltr">{new Date(msg.timestamp).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={msg.status}
                          onChange={(e) => handleUpdateContactStatus(msg.id, e.target.value)}
                          className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          <option value="new">جديد</option>
                          <option value="read">مقروء</option>
                          <option value="archived">مؤرشف</option>
                        </select>
                        <button
                          onClick={() => handleDeleteContactMessage(msg.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="حذف الرسالة"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-slate-700 whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>
                ))}
                {contactMessages.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <Mail className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p>لا توجد رسائل تواصل حالياً</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">إعدادات محتوى الموقع</h2>
            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-indigo-600 border-b pb-2">الرئيسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان الرئيسي</label>
                    <input type="text" value={settings.home_title || ''} onChange={e => setSettings({...settings, home_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان الفرعي</label>
                    <input type="text" value={settings.home_subtitle || ''} onChange={e => setSettings({...settings, home_subtitle: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
                    <textarea rows={3} value={settings.home_description || ''} onChange={e => setSettings({...settings, home_description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-indigo-600 border-b pb-2">من نحن</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان</label>
                    <input type="text" value={settings.about_title || ''} onChange={e => setSettings({...settings, about_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">الوصف الرئيسي</label>
                    <textarea rows={3} value={settings.about_description || ''} onChange={e => setSettings({...settings, about_description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">رؤيتنا</label>
                    <textarea rows={3} value={settings.about_vision || ''} onChange={e => setSettings({...settings, about_vision: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">التطوير المستمر</label>
                    <textarea rows={3} value={settings.about_development || ''} onChange={e => setSettings({...settings, about_development: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">فريق العمل</label>
                    <textarea rows={3} value={settings.about_team || ''} onChange={e => setSettings({...settings, about_team: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">الجودة</label>
                    <textarea rows={3} value={settings.about_quality || ''} onChange={e => setSettings({...settings, about_quality: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-indigo-600 border-b pb-2">القطاعات</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان</label>
                    <input type="text" value={settings.sectors_title || ''} onChange={e => setSettings({...settings, sectors_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
                    <textarea rows={3} value={settings.sectors_subtitle || ''} onChange={e => setSettings({...settings, sectors_subtitle: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-indigo-600 border-b pb-2">تواصل معنا والفوتر</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">عنوان قسم التواصل</label>
                    <input type="text" value={settings.contact_title || ''} onChange={e => setSettings({...settings, contact_title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">وصف قسم التواصل</label>
                    <textarea rows={3} value={settings.contact_subtitle || ''} onChange={e => setSettings({...settings, contact_subtitle: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">العنوان (المقر)</label>
                    <input type="text" value={settings.contact_address || ''} onChange={e => setSettings({...settings, contact_address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف</label>
                    <input type="text" value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                    <input type="email" value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ساعات العمل</label>
                    <input type="text" value={settings.contact_hours || ''} onChange={e => setSettings({...settings, contact_hours: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">نبذة الفوتر (عن الشركة)</label>
                    <textarea rows={3} value={settings.footer_about || ''} onChange={e => setSettings({...settings, footer_about: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="submit" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-xl">
              <h2 className="text-2xl font-bold mb-6">{editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
              <form onSubmit={handleSaveSection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">عنوان القسم</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الوصف</label>
                  <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700">حفظ</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200">إلغاء</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
