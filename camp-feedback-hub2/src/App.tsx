/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FeedbackSubmission, Language, DiningItem, ContactItem } from './types';
import { INITIAL_MOCK_FEEDBACK, TRANSLATIONS } from './data';
import ResidentForm from './components/ResidentForm';
import AdminDashboard from './components/AdminDashboard';
import CampGuide from './components/CampGuide';

const DEFAULT_DINING_HOURS: DiningItem[] = [
  {
    id: 'breakfast',
    titleAr: 'وجبة الفطور 🍳',
    titleEn: 'Breakfast Buffet 🍳',
    timeAr: '05:30 AM - 08:30 AM',
    timeEn: '05:30 AM - 08:30 AM',
    descAr: 'المشروبات الساخنة، العجة المطهوة طازجاً، الأجبان، والمأكولات المتنوعة.',
    descEn: 'Hot beverages, freshly made omelets, cheeses, and selection of fresh bread.'
  },
  {
    id: 'lunch',
    titleAr: 'وجبة الغداء 🍛',
    titleEn: 'Lunch Buffet 🍛',
    timeAr: '11:30 AM - 02:30 PM',
    timeEn: '11:30 AM - 02:30 PM',
    descAr: 'الكبسة العربية الأصيلة، الأرز النثري، خيارات الشواء واللحوم وسلطات طازجة.',
    descEn: 'Traditional Arabic Kabsa, grilled meats, rice variety, soup, and salad station.'
  },
  {
    id: 'dinner',
    titleAr: 'وجبة العشاء 🍲',
    titleEn: 'Dinner Buffet 🍲',
    timeAr: '06:30 PM - 09:30 PM',
    timeEn: '06:30 PM - 09:30 PM',
    descAr: 'أطباق ساخنة خفيفة ومتكاملة مع الحلويات الشرقية والفواكه الموسمية.',
    descEn: 'Light hot meals, balanced diet, assorted Arabic pastries, and seasonal fruits.'
  }
];

const DEFAULT_EMERGENCY_CONTACTS: ContactItem[] = [
  {
    id: 'emergency',
    nameAr: '🚨 خط الطوارئ العاجل في الكامب',
    nameEn: '🚨 Urgent Camp Emergency Line',
    number: '9999',
    subNumber: '+968 2438 9999',
    descAr: 'لأي حرائق، حوادث، أو حالات إنقاذ حرجة طوال الـ 24 ساعة.',
    descEn: 'For fire, accidents, or immediate rescue tasks available 24/7.',
    urgent: true
  },
  {
    id: 'clinic',
    nameAr: '🏥 العيادة الطبية والرعاية الصحية',
    nameEn: '🏥 Camp Medical & Health Clinic',
    number: '+968 2438 1234',
    subNumber: '',
    descAr: 'الكادر الطبي موجود للحالات الصحية وتوفير الأدوية اللازمة.',
    descEn: 'Residential doctor & medical staff ready to handle injuries and medicine.',
    urgent: false
  },
  {
    id: 'reception',
    nameAr: '🔑 مكتب الاستقبال وتنسيق السكن',
    nameEn: '🔑 Camp Accommodation Reception',
    number: '+968 2438 1111',
    subNumber: '',
    descAr: 'طلبات كرت الغرف، الصيانة السريعة، وتوزيع وتنسيق المفاتيح.',
    descEn: 'Smart key replacement, quick room fixing orders, and reception desk.',
    urgent: false
  },
  {
    id: 'hse',
    nameAr: '🍀 مكتب الصحة والسلامة المهنية (HSE)',
    nameEn: '🍀 HSE and Safety Department',
    number: '+968 2438 7777',
    subNumber: '',
    descAr: 'الإبلاغ عن أي مخاطر سلامة أو طلب معدات الحماية والوقاية.',
    descEn: 'Report safety hazards or request occupational shield gear.',
    urgent: false
  }
];

import { 
  Languages, 
  LayoutDashboard, 
  Vote, 
  ShieldAlert, 
  X,
  Sparkles,
  Info,
  Calendar,
  CheckCircle,
  HelpCircle,
  Heart,
  Lock,
  Unlock,
  Phone,
  Coffee,
  AlertTriangle,
  Activity,
  Clock,
  Utensils
} from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [view, setView] = useState<'resident' | 'admin'>('resident');
  const [residentTab, setResidentTab] = useState<'feedback' | 'guide'>('feedback');
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);

  // Guide dynamic state
  const [diningHours, setDiningHours] = useState<DiningItem[]>(() => {
    const cached = localStorage.getItem('camp_dining_hours_v1');
    return cached ? JSON.parse(cached) : DEFAULT_DINING_HOURS;
  });

  const [emergencyContacts, setEmergencyContacts] = useState<ContactItem[]>(() => {
    const cached = localStorage.getItem('camp_emergency_contacts_v1');
    return cached ? JSON.parse(cached) : DEFAULT_EMERGENCY_CONTACTS;
  });

  const saveDiningHours = (updated: DiningItem[]) => {
    setDiningHours(updated);
    localStorage.setItem('camp_dining_hours_v1', JSON.stringify(updated));
  };

  const saveEmergencyContacts = (updated: ContactItem[]) => {
    setEmergencyContacts(updated);
    localStorage.setItem('camp_emergency_contacts_v1', JSON.stringify(updated));
  };

  
  // Custom Toast System State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Admin authentication states
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('camp_admin_authenticated_v1') === 'true';
  });

  const [adminPIN, setAdminPIN] = useState<string>(() => {
    return localStorage.getItem('camp_admin_pin_v1') || '2026';
  });

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleVerifyPIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === adminPIN) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('camp_admin_authenticated_v1', 'true');
      setPinInput('');
      setPinError(false);
      showToast(lang === 'ar' ? 'مرحباً بك! تم إلغاء قفل لوحة المشرفين بنجاح.' : 'Welcome! Manager Dashboard successfully unlocked.', 'success');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // Initialize data from LocalStorage or mock data on load
  useEffect(() => {
    const cached = localStorage.getItem('camp_feedback_submissions_v1');
    if (cached) {
      try {
        setSubmissions(JSON.parse(cached));
      } catch (e) {
        setSubmissions(INITIAL_MOCK_FEEDBACK);
      }
    } else {
      setSubmissions(INITIAL_MOCK_FEEDBACK);
      localStorage.setItem('camp_feedback_submissions_v1', JSON.stringify(INITIAL_MOCK_FEEDBACK));
    }
  }, []);

  // Save submissions state to LocalStorage whenever it changes
  const saveSubmissions = (updated: FeedbackSubmission[]) => {
    setSubmissions(updated);
    localStorage.setItem('camp_feedback_submissions_v1', JSON.stringify(updated));
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Add resident feedback submission
  const handleAddNewFeedback = (
    newFb: Omit<FeedbackSubmission, 'id' | 'timestamp' | 'status'>
  ) => {
    const idNum = Math.floor(100 + Math.random() * 900);
    const submission: FeedbackSubmission = {
      ...newFb,
      id: `FB-${idNum}`,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    const updated = [submission, ...submissions];
    saveSubmissions(updated);
    showToast(lang === 'ar' ? 'تم تقديم تقييمك بنجاح! شكراً لمساهمتك.' : 'Feedback submitted successfully! Thank you.', 'success');
  };

  // Change submission status (reviewed, resolved)
  const handleStatusChange = (id: string, newStatus: FeedbackSubmission['status']) => {
    const updated = submissions.map((s) => {
      if (s.id === id) {
        return { ...s, status: newStatus };
      }
      return s;
    });
    saveSubmissions(updated);
    
    let statusMsgAr = newStatus === 'resolved' ? 'تم حل المشكلة بنجاح وبسرعة!' : 'تمت قراءة التقييم ومراجعته.';
    let statusMsgEn = newStatus === 'resolved' ? 'Issue resolved!' : 'Feedback reviewed.';
    showToast(lang === 'ar' ? statusMsgAr : statusMsgEn, 'success');
  };

  // Delete evaluation
  const handleDeleteEvaluation = (id: string) => {
    const updated = submissions.filter(s => s.id !== id);
    saveSubmissions(updated);
    showToast(lang === 'ar' ? 'تم حذف التقييم السجل بنجاح.' : 'Feedback record has been deleted.', 'info');
  };

  // Add 5 random mock feedbacks
  const handleAddMockData = () => {
    const mockNamesAr = ['سلطان العتيبي', 'ماجد الشهراني', 'طالب عبدالمحسن', 'عبدالإله الحربي', 'أيمن الزهراني'];
    const mockNamesEn = ['Vikram Singh', 'James Watson', 'Robert Lee', 'David Chang', 'Ali Hassan'];
    const rooms = ['A-22', 'B-14', 'C-09', 'D-15', 'E-03', 'F-12', 'A-05'];
    
    const foodComments = [
      'الفطور اليوم كان رائعاً والجبنة ممتازة، لكن البهارت كانت صعبة قليلة.',
      'الغداء شهي وساخن جداً والرز ناضج. كبسة الحاشي مذهلة!',
      'العشاء لذيذ وخفيف ولكن نريد خيارات فواكه أكثر.'
    ];
    const cleanComments = [
      'تنظيف الغرفة اليوم كان متكاملاً والتهوية رائعة، شكراً للشاب المحترف.',
      'يرجى التركيز على تنظيف السجادة بالمكنسة الكهربائية والروائح العطرة.',
      'التنظيف العميق استغرق وقتاً طويلاً ولكنه مثالي.'
    ];
    const laundryComments = [
      'سرعة استثنائية في كي الملابس وتسليمها اليوم.',
      'الكي منسق جداً، لكن رائحة الصابون قوية قليلاً.',
      'ممتاز جداً ونظيف شكراً جزيلاً.'
    ];

    const newMocks: FeedbackSubmission[] = Array.from({ length: 5 }).map((_, idx) => {
      const isArabic = Math.random() > 0.4;
      const catRand = Math.random();
      let category: 'food' | 'cleaning' | 'laundry' = 'food';
      let subCategory: any = 'breakfast';
      let comment = '';
      let tags: string[] = [];
      const rating = Math.floor(3 + Math.random() * 3); // 3, 4, 5

      if (catRand < 0.33) {
        category = 'food';
        const subs = ['breakfast', 'lunch', 'dinner'];
        subCategory = subs[Math.floor(Math.random() * subs.length)];
        comment = isArabic ? foodComments[Math.floor(Math.random() * foodComments.length)] : 'The meals are great and very hygienic today. Recommended!';
        tags = isArabic ? ['طعم لذيذ ✨', 'ساخن وجيد 🔥'] : ['Delicious Taste ✨', 'Served Hot 🔥'];
      } else if (catRand < 0.66) {
        category = 'cleaning';
        const subs = ['regular_cleaning', 'deep_cleaning'];
        subCategory = subs[Math.floor(Math.random() * subs.length)];
        comment = isArabic ? cleanComments[Math.floor(Math.random() * cleanComments.length)] : 'Superb room service. Smells absolutely fantastic!';
        tags = isArabic ? ['تنظيف عميق واحترافي ✨', 'رائحة عطرة ولطيفة 🌸'] : ['Deep & Pro Clean ✨', 'Fresh & Pleasant Smell 🌸'];
      } else {
        category = 'laundry';
        subCategory = 'general';
        comment = isArabic ? laundryComments[Math.floor(Math.random() * laundryComments.length)] : 'Prompt laundry response and perfect iron folding arrangement.';
        tags = isArabic ? ['كيّ وسَحب ممتاز 👔', 'تسليم سريع في الموعد ⚡'] : ['Excellent Pressing 👔', 'Fast/On-Time Delivery ⚡'];
      }

      const idNum = Math.floor(100 + Math.random() * 900);
      const randomDate = new Date();
      randomDate.setHours(randomDate.getHours() - Math.floor(Math.random() * 48));

      return {
        id: `FB-${idNum}`,
        residentName: isArabic ? mockNamesAr[idx] : mockNamesEn[idx],
        roomNumber: rooms[Math.floor(Math.random() * rooms.length)],
        timestamp: randomDate.toISOString(),
        category,
        subCategory,
        rating,
        tags,
        comment,
        status: Math.random() > 0.5 ? 'reviewed' : 'pending'
      };
    });

    const updated = [...newMocks, ...submissions];
    saveSubmissions(updated);
    showToast(lang === 'ar' ? 'تم توليد 5 تقييمات عشوائية بنجاح لتجربة لوحة التحكم!' : 'Generated 5 sample feedback files for immediate display!', 'success');
  };

  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-orange-100/40 flex flex-col font-sans transition-all duration-300">
      
      {/* TOAST SYSTEM OUTLET */}
      {toast && (
        <div 
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-3xl shadow-xl flex items-center justify-between gap-4 border max-w-md w-[90%] animate-fade-in backdrop-blur-xl ${
            toast.type === 'success' 
              ? 'bg-emerald-600/90 text-white border-emerald-500/50' 
              : toast.type === 'error'
              ? 'bg-rose-600/90 text-white border-rose-500/50'
              : 'bg-indigo-950/90 text-indigo-100 border-indigo-900/50'
          }`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <p className="text-xs md:text-sm font-semibold">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-white/85 hover:text-white transition-opacity p-1 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* GLOBAL BANNER */}
      <div className="bg-slate-900/95 backdrop-blur-md text-emerald-300 text-xs py-2.5 px-4 border-b border-white/10 text-center flex items-center justify-center gap-2 font-semibold">
        <Sparkles size={14} className="animate-pulse text-emerald-400" />
        <span>
          {lang === 'ar' 
            ? '🚀 واجهة "Frosted Glass" المصقولة نشطة وخيارات تخزين متكاملة' 
            : '🚀 Polished "Frosted Glass" theme active with persistent storage options'
          }
        </span>
      </div>

      {/* TOP DECORATIVE LOGO HEADER */}
      <header className="border-b border-white/60 sticky top-0 z-40 backdrop-blur-xl bg-white/40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex flex-col gap-3.5 py-1" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div>
              <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                <span>{t.title}</span>
              </h1>
              <p className="text-[10px] md:text-xs text-slate-500 font-semibold font-sans mt-1.5">
                {lang === 'ar' ? 'نظام تحسين جودة الحياة في المقر السكني' : 'Residential Standards and Quality of Life Hub'}
              </p>
            </div>
            
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden shadow-xl border-2 border-white/80 hover:rotate-2 hover:scale-105 transition-all duration-300 cursor-pointer bg-white flex-shrink-0">
              <img 
                src="https://cdn.phototourl.com/free/2026-06-15-269e9c04-95e7-4d17-b877-1f4dafffd0f0.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Bilingual language switcher */}
            <button
              onClick={() => {
                const nextLang = lang === 'ar' ? 'en' : 'ar';
                setLang(nextLang);
                showToast(nextLang === 'ar' ? 'تم تحويل لغة الموقع إلى العربية' : 'Language switched to English', 'info');
              }}
              className="px-4 py-2 backdrop-blur-md bg-white/50 border border-white/80 hover:bg-white/80 hover:border-slate-350 text-slate-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Change Language"
            >
              <Languages size={14} className="text-slate-600" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* Toggle View View State */}
            <div className="hidden sm:flex border border-white/60 p-1 bg-white/30 backdrop-blur-md rounded-2xl gap-1">
              <button
                onClick={() => setView('resident')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  view === 'resident'
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{t.residentPortal}</span>
              </button>
              <button
                onClick={() => setView('admin')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  view === 'admin'
                    ? 'bg-slate-900 text-white shadow-sm font-bold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <span>{t.adminPanel}</span>
                <span className="bg-rose-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                  {submissions.filter(s => s.status === 'pending').length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE STATE BANNER TOGGLE */}
      <div className="sm:hidden border-b border-white/40 p-2 text-center flex justify-center backdrop-blur-md bg-white/30">
        <div className="flex border border-white/60 p-1 bg-white/40 rounded-2xl w-full max-w-sm">
          <button
            onClick={() => setView('resident')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              view === 'resident' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            <Vote size={13} />
            <span>{t.residentPortal}</span>
          </button>
          <button
            onClick={() => setView('admin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer relative ${
              view === 'admin' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700'
            }`}
          >
            <LayoutDashboard size={13} />
            <span>{t.adminPanel}</span>
            <span className="absolute -top-1 right-2 bg-rose-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black">
              {submissions.filter(s => s.status === 'pending').length}
            </span>
          </button>
        </div>
      </div>

      {/* HERO SECTION BACKGROUND */}
      <section className="py-10 md:py-14 text-center px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-5 -translate-y-1/2 w-48 h-48 bg-indigo-200/40 rounded-full blur-3xl hidden md:block" />
        <div className="absolute top-1/2 right-5 -translate-y-1/2 w-48 h-48 bg-orange-100/40 rounded-full blur-3xl hidden md:block" />

        <div className="max-w-3xl mx-auto space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {view === 'resident' ? (
            <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-800 text-[10px] md:text-xs font-bold tracking-wider uppercase border border-indigo-500/20 animate-pulse">
              <Vote size={12} />
              <span>{t.residentPortal}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-rose-500/10 text-rose-800 text-[10px] md:text-xs font-bold tracking-wider uppercase border border-rose-500/20">
              <ShieldAlert size={12} />
              <span>{t.adminPanel}</span>
            </div>
          )}

          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {view === 'resident' ? t.title : t.adminPanel}
          </h2>

          <p className="text-sm md:text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed font-sans">
            {view === 'resident' ? t.subtitle : t.adminViewDesc}
          </p>
        </div>
      </section>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 md:py-8">
        {view === 'resident' ? (
          <div className="space-y-6">
            {/* Elegant Welcome Greeting */}
            <div className="text-center max-w-2xl mx-auto mb-8 animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-3xl bg-teal-550/10 text-teal-950 font-black shadow-md border border-teal-500/20 text-sm md:text-base leading-relaxed bg-white/70 backdrop-blur-md">
                <span className="text-xl animate-pulse">🌴</span>
                <span>
                  {lang === 'ar' 
                    ? 'نرحب بالقاطنين والزوار الكرام في مخيم قرن العلم' 
                    : 'We warmly welcome all residents and visitors to Qarn Al Alam Camp'}
                </span>
                <span className="text-xl animate-pulse">🌴</span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-3 max-w-md mx-auto leading-relaxed">
                {lang === 'ar' 
                  ? 'صوتكم يسهم في تحسين جودة حياتكم المعيشية؛ تفضلوا بتقييم خدماتنا أو الاطلاع على الدليل الإرشادي.' 
                  : 'Your feedback helps us raise living standards. Evaluate our services or click below to explore our official guide.'}
              </p>
            </div>

            {/* Resident Sub-Navigation Tabs */}
            <div className="flex justify-center gap-3.5 max-w-md mx-auto mb-8 border-b border-indigo-950/5 pb-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <button
                type="button"
                onClick={() => setResidentTab('feedback')}
                className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs md:text-sm shadow-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                  residentTab === 'feedback'
                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 transform scale-[1.02]'
                    : 'bg-white/75 text-slate-700 border-white/90 hover:bg-white hover:text-slate-950 hover:shadow-sm'
                }`}
              >
                <Vote size={15} />
                <span>{lang === 'ar' ? 'منصة التقييمات والاستبيان' : 'Service Evaluation'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setResidentTab('guide')}
                className={`flex-1 py-3 px-5 rounded-2xl font-black text-xs md:text-sm shadow-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                  residentTab === 'guide'
                    ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-700 transform scale-[1.02]'
                    : 'bg-white/75 text-slate-700 border-white/90 hover:bg-white hover:text-slate-950 hover:shadow-sm'
                }`}
              >
                <Clock size={15} />
                <span>{lang === 'ar' ? 'التواقيت والأرقام الهامة' : 'Schedules & Emergency'}</span>
              </button>
            </div>

            {/* View Switcher Container */}
            <div className="transition-all duration-300">
              {residentTab === 'feedback' ? (
                <ResidentForm 
                  lang={lang} 
                  onSubmit={handleAddNewFeedback} 
                  onNavigateToDashboard={() => {
                    setView('admin');
                  }}
                />
              ) : (
                <CampGuide lang={lang} diningHours={diningHours} emergencyContacts={emergencyContacts} />
              )}
            </div>
          </div>
        ) : !isAdminAuthenticated ? (
          <div className="max-w-md mx-auto my-12 backdrop-blur-xl bg-white/30 border border-white/60 p-8 rounded-3xl shadow-2xl space-y-6 text-center animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto shadow-inner">
              <Lock size={32} className="animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                {lang === 'ar' ? 'منطقة المشرفين محمية' : 'Admin Panel Protected'}
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                {lang === 'ar' 
                  ? 'هذه اللوحة مخصصة لإدارة الكامب فقط ومحمية لمنع وصول غير المصرح لهم.' 
                  : 'This dashboard is secure and restricted to camp management staff only.'}
              </p>
            </div>

            <form onSubmit={handleVerifyPIN} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  autoFocus
                  placeholder={lang === 'ar' ? 'أدخل رمز المرور الخاص بك' : 'Enter admin passcode'}
                  className={`w-full px-4 py-3 border rounded-2xl text-center font-mono text-lg focus:outline-hidden focus:ring-2 transition-all tracking-widest ${
                    pinError 
                      ? 'border-red-400 bg-red-50/40 text-red-700 focus:ring-red-100' 
                      : 'border-white/60 bg-white/55 text-slate-800 placeholder:text-slate-400 focus:bg-white/85 focus:ring-indigo-500/20'
                  }`}
                />
                
                {pinError && (
                  <span className="text-xs text-red-600 font-bold mt-1.5 block">
                    {lang === 'ar' ? '❌ رمز المرور المدخل غير صحيح!' : '❌ Incorrect passcode entered!'}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Unlock size={14} />
                <span>{lang === 'ar' ? 'تأكيد الرمز وفتح اللوحة' : 'Verify & Unlock Panel'}</span>
              </button>
            </form>

            <div className="pt-4 border-t border-white/20 text-[10px] text-slate-400 font-semibold space-y-1">
              <div>
                💡 {lang === 'ar' ? 'رمز المرور الافتراضي هو: ' : 'Default administrative passcode: '}
                <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded-sm text-slate-700 border border-white/40 font-black">2026</span>
              </div>
              <div>
                ⚙️ {lang === 'ar' ? 'نصيحة: يمكنك تغيير رمز المرور من إعدادات اللوحة في أي وقت.' : 'Note: You can change this PIN anytime inside the dashboard settings.'}
              </div>
            </div>
          </div>
        ) : (
          <AdminDashboard 
            lang={lang} 
            submissions={submissions}
            onStatusChange={handleStatusChange} 
            onDelete={handleDeleteEvaluation}
            onAddMockData={handleAddMockData}
            adminPIN={adminPIN}
            diningHours={diningHours}
            emergencyContacts={emergencyContacts}
            onUpdateDiningHours={saveDiningHours}
            onUpdateEmergencyContacts={saveEmergencyContacts}
            onChangePIN={(newPin) => {
              setAdminPIN(newPin);
              localStorage.setItem('camp_admin_pin_v1', newPin);
              showToast(lang === 'ar' ? 'تم تحديث رمز المرور الخاص للإدارة بنجاح!' : 'Admin passcode changed successfully!', 'success');
            }}
            onLogout={() => {
              setIsAdminAuthenticated(false);
              localStorage.setItem('camp_admin_authenticated_v1', 'false');
              setView('resident');
              showToast(lang === 'ar' ? 'تم تسجيل خروج الإدارة وتأمين اللوحة.' : 'Logged out. Admin panel secured.', 'info');
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <p className="font-semibold">{t.footerText}</p>
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-350">
            <span>Powered with</span>
            <Heart size={10} className="fill-rose-500 text-rose-500 animate-pulse" />
            <span>for Camp residents luxury</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
