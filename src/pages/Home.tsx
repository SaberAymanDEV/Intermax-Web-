import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  Users,
  TrendingUp,
  ArrowLeft,
  Target,
  Award,
  MapPin,
  Phone,
  Mail,
  Clock,
  Building,
  FileText,
  Briefcase,
  HardHat,
  Hammer,
  Plug,
  Bath,
  Zap,
  PaintRoller,
  Wind,
  Package,
} from "lucide-react";
import { api } from "../services/api";

interface Section {
  id: number;
  title: string;
  description: string;
}

const getSectorMeta = (title: string) => {
  if (title.includes("فنادق")) return { icon: Building };
  if (title.includes("أوراق")) return { icon: FileText };
  if (title.includes("مكتبية")) return { icon: Briefcase };
  if (title.includes("بناء")) return { icon: HardHat };
  if (title.includes("حديد") || title.includes("معادن"))
    return { icon: Hammer };
  if (title.includes("أجهزة")) return { icon: Plug };
  if (title.includes("صحي")) return { icon: Bath };
  if (title.includes("كهرباء")) return { icon: Zap };
  if (title.includes("دهانات")) return { icon: PaintRoller };
  if (title.includes("تكييف")) return { icon: Wind };
  return { icon: Package };
};

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionsData, settingsData] = await Promise.all([
          api("/api/sections"),
          api("/api/settings")
        ]);
        setSections(sectionsData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api("/api/contact", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Failed to submit message", error);
      alert("حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full" dir="rtl">
      {/* Hero Section */}
      <section
        id="home"
        className="relative bg-slate-900 text-white overflow-hidden min-h-[90vh] flex items-center"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Corporate Background"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span className="text-sm font-medium text-indigo-100">
                {settings.home_subtitle || 'الخيار الأول للشركات في مصر'}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              {settings.home_title || 'شريكك الموثوق في التوريدات العامة'}
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed font-light">
              {settings.home_description || 'شركة إنترماكس للتوكيلات التجارية تقدم حلولاً متكاملة ومتميزة في مجال التوريدات العامة داخل جمهورية مصر العربية.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#sectors"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                استكشف قطاعاتنا
                <ArrowLeft className="w-5 h-5" />
              </a>
              <a
                href="#contact"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center border border-white/10"
              >
                تواصل معنا
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
            >
              {settings.about_title || 'من نحن'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed"
            >
              {settings.about_description || 'تتشرف شركة انترماكس للتوكيلات التجارية بأن تقدم نفسها كإحدى الشركات المتخصصة في مجال التوريدات العامة. تأسست الشركة في عام 2025 بهدف تقديم حلول متكاملة ومتميزة لعملائها داخل جمهورية مصر العربية.'}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-20"
          >
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1 space-y-6">
                <h3 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <Target className="w-8 h-8 text-indigo-600" />
                  نبذة عن الشركة
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  حرصت الشركة على الالتزام بأعلى معايير الجودة في المنتجات
                  والخدمات التي تقدمها، مدعومة بفريق عمل ذو خبرة وكفاءة عالية،
                  مما مكنها من بناء سمعة طيبة وعلاقات تعاون ناجحة مع العديد من
                  الجهات الحكومية والخاصة.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  تسعى الشركة دائماً إلى تطوير خدماتها بما يتواكب مع متطلبات
                  السوق المحلية والعالمية، وتحرص على الالتزام الكامل بالمصداقية
                  والشفافية وتطبيق معايير السلامة والجودة.
                </p>
              </div>
              <div className="flex-1 w-full">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                  alt="Intermax Office"
                  className="rounded-2xl shadow-lg w-full object-cover h-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">رؤيتنا</h4>
              <p className="text-slate-600 leading-relaxed text-lg">
                {settings.about_vision || 'أن نكون الشريك الرائد والموثوق في مجال التوريدات العامة والتصدير داخل جمهورية مصر العربية وخارجها، من خلال تقديم حلول متكاملة عالية الجودة.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">
                التطوير المستمر
              </h4>
              <p className="text-slate-600 leading-relaxed text-lg">
                {settings.about_development || 'نلتزم بالتطوير والتحسين الدائم لخدماتنا ومنظومة أعمالنا، بما يواكب متغيرات السوق المحلية والعالمية، ويعزز قدرتنا على تقديم حلول مبتكرة.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">
                فريق العمل
              </h4>
              <p className="text-slate-600 leading-relaxed text-lg">
                {settings.about_team || 'نعتز بفريق عمل يتمتع بخبرة واسعة وكفاءة عالية، يعمل بروح التعاون والالتزام، مما أسهم في بناء سمعة قوية وعلاقات شراكة ناجحة ومستدامة.'}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">الجودة</h4>
              <p className="text-slate-600 leading-relaxed text-lg">
                {settings.about_quality || 'نلتزم بتطبيق أعلى معايير الجودة في جميع المنتجات والخدمات التي نقدمها، لضمان تحقيق رضا عملائنا وتعزيز الثقة المستدامة في تعاملاتنا.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sectors Section */}
      <section id="sectors" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
            >
              {settings.sectors_title || 'قطاعات التوريدات'}
            </motion.h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {settings.sectors_subtitle || 'نقدم مجموعة واسعة من الخدمات والمنتجات لتلبية كافة احتياجات عملائنا في مختلف القطاعات.'}
            </p>
          </div>

          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section, index) => {
                const { icon: Icon } = getSectorMeta(section.title);
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-slate-50 rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 group p-8 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                        {section.title}
                      </h3>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {section.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p>جاري تحميل القطاعات...</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight"
            >
              {settings.contact_title || 'تواصل معنا'}
            </motion.h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {settings.contact_subtitle || 'نحن هنا للإجابة على استفساراتكم وتلبية احتياجاتكم. لا تترددوا في الاتصال بنا.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start space-x-6 space-x-reverse hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    العنوان
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {settings.contact_address || '٤٠ شارع شريف تقاطع راغب حلوان'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start space-x-6 space-x-reverse hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    الهاتف
                  </h3>
                  <a href={`tel:${settings.contact_phone || '01116922271'}`} className="text-slate-600 hover:text-indigo-600 leading-relaxed transition-colors block" dir="ltr">
                    {settings.contact_phone || '01116922271'}
                  </a>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start space-x-6 space-x-reverse hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    البريد الإلكتروني
                  </h3>
                  <a href={`mailto:${settings.contact_email || 'intermax@intermax-info.com'}`} className="text-slate-600 hover:text-indigo-600 leading-relaxed transition-colors block">
                    {settings.contact_email || 'intermax@intermax-info.com'}
                  </a>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-start space-x-6 space-x-reverse hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    ساعات العمل
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {settings.contact_hours || 'الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-8">
                أرسل لنا رسالة
              </h3>
              {isSubmitted ? (
                <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl text-center border border-emerald-100">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold mb-2">
                    تم إرسال رسالتك بنجاح!
                  </h4>
                  <p>سنتواصل معك في أقرب وقت ممكن.</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      الرسالة
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="اكتب رسالتك هنا..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-70"
                  >
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
