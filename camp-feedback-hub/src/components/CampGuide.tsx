import React, { useState } from 'react';
import { Language, DiningItem, ContactItem } from '../types';
import { 
  Clock, 
  Phone, 
  AlertTriangle, 
  Activity, 
  Heart, 
  Coffee, 
  Utensils, 
  Moon, 
  Check, 
  Copy, 
  Sparkles,
  Shield,
  MapPin,
  Flame,
  Dumbbell,
  Info
} from 'lucide-react';

interface CampGuideProps {
  lang: Language;
  diningHours: DiningItem[];
  emergencyContacts: ContactItem[];
}

export default function CampGuide({ lang, diningHours, emergencyContacts }: CampGuideProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const isAr = lang === 'ar';

  const getDiningStyle = (id: string) => {
    if (id === 'breakfast') {
      return {
        icon: Coffee,
        iconColor: 'text-amber-600 bg-amber-100/60',
        color: 'from-amber-500/10 to-orange-500/5 border-amber-200/50'
      };
    }
    if (id === 'lunch') {
      return {
        icon: Utensils,
        iconColor: 'text-emerald-600 bg-emerald-100/60',
        color: 'from-emerald-500/10 to-teal-500/5 border-emerald-200/50'
      };
    }
    if (id === 'dinner') {
      return {
        icon: Moon,
        iconColor: 'text-indigo-600 bg-indigo-100/60',
        color: 'from-indigo-500/10 to-violet-500/5 border-indigo-200/50'
      };
    }
    return {
      icon: Utensils,
      iconColor: 'text-teal-600 bg-teal-100/60',
      color: 'from-teal-500/10 to-cyan-500/5 border-teal-200/50'
    };
  };

  const getContactIcon = (id: string) => {
    if (id === 'emergency') return Flame;
    if (id === 'clinic') return Activity;
    if (id === 'reception') return Shield;
    if (id === 'hse') return Shield;
    return Phone;
  };

  const facilities = [
    {
      nameAr: 'غسيل الملابس (اللاوندري)',
      nameEn: 'Laundry Service',
      timeAr: '07:00 AM - 09:00 PM',
      timeEn: '07:00 AM - 09:00 PM',
      descAr: 'استلام مجهز ببطاقات للتنظيف والكي اليومي المعتمد.',
      descEn: 'Daily clothes washing, careful ironing, and rapid delivery cycle.'
    },
    {
      nameAr: 'الصالة الرياضية (الجيم)',
      nameEn: 'Gym & Fitness Center',
      timeAr: 'متاح على مدار 24 ساعة',
      timeEn: 'Open 24 Hours Active',
      descAr: 'أجهزة الكارديو، الأثقال الحرة، والتكييف المتكامل لدعم لياقتكم.',
      descEn: 'Treadmills, weight training sets, and chilled cooling system.'
    }
  ];


  return (
    <div className="space-y-8 animate-fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Intoduction/Map visual */}
      <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-indigo-600/10 rounded-2xl text-indigo-700 flex-shrink-0">
          <MapPin size={36} className="animate-bounce" />
        </div>
        <div className="space-y-1.5 flex-1 text-center md:text-right">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 justify-center md:justify-start">
            <span>{isAr ? 'مخيم قرن العلم - دليل الخدمات السريع' : 'Qarn Al Alam Camp - Facility Guide'}</span>
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
          </h3>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-2xl font-sans">
            {isAr 
              ? 'نهتم بسلامتكم وتوفير سبل الراحة المثالية لكم. تم جمع التواقيت الرسمية للصالة وأهم خطوط الاتصال العاجلة في الكامب لسهولة الوصول المباشر.' 
              : 'Our priority is your comfort and security. Here is your quick-reference sheet for meals and emergency services.'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Dining Schedule Card Group */}
        <div className="lg:col-span-6 space-y-6">
          <div className="backdrop-blur-xl bg-white/30 border border-white/60 p-5 md:p-6 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-950/5">
              <Clock size={18} className="text-indigo-600" />
              <h4 className="text-base font-black text-slate-900">
                {isAr ? '🍔 مواعيد صالة الطعام والوجبات اليومية' : '🍔 Dining Hall Schedules'}
              </h4>
            </div>

            <div className="space-y-4">
              {diningHours.map((meal) => {
                const { icon: IconComp, iconColor, color: styleColor } = getDiningStyle(meal.id);
                return (
                  <div
                    key={meal.id}
                    className={`p-4 rounded-2xl border bg-gradient-to-br ${styleColor} transition-all duration-300 hover:scale-[1.01]`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor} flex-shrink-0`}>
                          <IconComp size={20} />
                        </div>
                        <div>
                          <h5 className="font-extrabold text-slate-950 text-sm md:text-base leading-none">
                            {isAr ? meal.titleAr : meal.titleEn}
                          </h5>
                          <p className="text-xs text-purple-950/70 font-semibold mt-1.5 max-w-sm font-sans leading-relaxed">
                            {isAr ? meal.descAr : meal.descEn}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono flex-shrink-0 bg-white/70 px-2.5 py-1 rounded-xl border border-white/80 text-[10px] md:text-xs font-black text-indigo-950 shadow-xs">
                        {isAr ? meal.timeAr : meal.timeEn}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] p-2.5 bg-indigo-50/50 text-indigo-800/80 font-semibold rounded-xl border border-indigo-100 flex items-center gap-2">
              <Info size={12} className="flex-shrink-0 text-indigo-600" />
              <span>
                {isAr 
                  ? 'ملاحظة: تفتح البوابات قبل الوجبات بـ 10 دقائق لراحة وتفادي الازدحام.' 
                  : 'Note: Dining gates open 10 mins prior to schedules for crowd easing purposes.'
                }
              </span>
            </div>
          </div>

          {/* Secondary Camp Facilities Card */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/60 p-5 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Dumbbell size={16} className="text-slate-700" />
              <h4 className="text-sm font-black text-slate-900 animate-pulse">
                {isAr ? '🏢 مرافق وتواقيت إضافية في الكامب' : '🏢 Additional Camp Facilities'}
              </h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {facilities.map((fac, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-white bg-white/20 hover:bg-white/40 transition-all">
                  <span className="block text-xs font-extrabold text-slate-950 mb-1">
                    {isAr ? fac.nameAr : fac.nameEn}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-indigo-600/10 text-indigo-700 rounded-md text-[10px] font-black font-mono mb-1.5">
                    {isAr ? fac.timeAr : fac.timeEn}
                  </span>
                  <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                    {isAr ? fac.descAr : fac.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vital Contacts Card Group */}
        <div className="lg:col-span-6">
          <div className="backdrop-blur-xl bg-white/30 border border-white/60 p-5 md:p-6 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-indigo-950/5">
              <Phone size={18} className="text-orange-600 animate-pulse" />
              <h4 className="text-base font-black text-slate-900">
                {isAr ? '📞 دليل أرقام التواصل والخدمات الحيوية' : '📞 Emergency & Vital Contact Book'}
              </h4>
            </div>

            <div className="space-y-4">
              {emergencyContacts.map((contact) => {
                const IconComp = getContactIcon(contact.id);
                return (
                  <div
                    key={contact.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                      contact.urgent 
                        ? 'bg-rose-50/70 border-rose-200 shadow-md ring-2 ring-rose-500/10' 
                        : 'bg-white/25 border-white/80 hover:bg-white/40'
                    }`}
                  >
                    {contact.urgent && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-rose-600 text-white rounded-md text-[8px] font-black animate-pulse uppercase tracking-wider">
                        {isAr ? 'طارئ وعاجل' : 'Urgent Only'}
                      </span>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center gap-1 font-extrabold text-sm md:text-base leading-none ${contact.urgent ? 'text-rose-950 font-black' : 'text-slate-950 font-bold'}`}>
                          {isAr ? contact.nameAr : contact.nameEn}
                        </span>
                        <p className={`text-[11px] font-semibold ${contact.urgent ? 'text-rose-700/85' : 'text-slate-500'}`}>
                          {isAr ? contact.descAr : contact.descEn}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <div className="text-left font-mono">
                          <span className={`block text-sm md:text-base font-black leading-none ${contact.urgent ? 'text-rose-600' : 'text-slate-800'}`}>
                            {contact.number}
                          </span>
                          {contact.subNumber && (
                            <span className="text-[10px] text-slate-400 font-bold block mt-1">
                              {contact.subNumber}
                            </span>
                          )}
                        </div>

                        {/* Interactive Action Triggers */}
                        <div className="flex gap-1.5 self-center">
                          {/* Call Button */}
                          <a
                            href={`tel:${contact.number.replace(/\s+/g, '')}`}
                            className={`p-2 rounded-xl transition-all cursor-pointer transform active:scale-95 flex items-center justify-center ${
                              contact.urgent
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : 'bg-slate-950 hover:bg-slate-800 text-white'
                            }`}
                            title={isAr ? 'اتصال مباشر' : 'Direct Call'}
                          >
                            <Phone size={14} className="animate-pulse" />
                          </a>

                          {/* Quick Copy Button */}
                          <button
                            onClick={() => copyToClipboard(contact.number, contact.id)}
                            className="p-2 rounded-xl border border-white/80 bg-white/70 hover:bg-white text-slate-600 hover:text-slate-800 transition-all cursor-pointer transform active:scale-95 flex items-center justify-center"
                            title={isAr ? 'نسخ الرقم' : 'Copy number'}
                          >
                            {copiedId === contact.id ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-[10px] p-2.5 bg-rose-50/50 text-rose-800/80 font-semibold rounded-xl border border-rose-100 flex items-start gap-2">
              <AlertTriangle size={14} className="flex-shrink-0 text-rose-600 mt-0.5 animate-pulse" />
              <span>
                {isAr 
                  ? 'تحذير السلامة: يرجى الاتصال بخط الطوارئ (9999) فوراً في حال حدوث أي حريق أو تسرب للمواد في أي جناح سكني لتوجيه فِرَق الفحص فوراً.' 
                  : 'Safety advice: Contact the hotline (9999) immediately during fire hazards for rapid check responses.'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
