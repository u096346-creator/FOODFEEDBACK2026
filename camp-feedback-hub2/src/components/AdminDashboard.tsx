/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FeedbackSubmission, Language, FeedbackCategory, DiningItem, ContactItem } from '../types';
import { TRANSLATIONS } from '../data';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Check, 
  Eye, 
  Sparkle, 
  Sparkles,
  Utensils,
  Waves,
  RefreshCw,
  Clock,
  ThumbsUp,
  X,
  Home,
  User,
  Lock,
  Edit2,
  Plus,
  Moon,
  Coffee,
  Shield,
  Phone,
  Flame,
  Activity
} from 'lucide-react';

interface AdminDashboardProps {
  lang: Language;
  submissions: FeedbackSubmission[];
  onStatusChange: (id: string, newStatus: FeedbackSubmission['status']) => void;
  onDelete: (id: string) => void;
  onAddMockData: () => void;
  adminPIN?: string;
  onChangePIN?: (newPin: string) => void;
  onLogout?: () => void;
  diningHours: DiningItem[];
  emergencyContacts: ContactItem[];
  onUpdateDiningHours: (updated: DiningItem[]) => void;
  onUpdateEmergencyContacts: (updated: ContactItem[]) => void;
}

export default function AdminDashboard({ 
  lang, 
  submissions, 
  onStatusChange, 
  onDelete, 
  onAddMockData,
  adminPIN = '2026',
  onChangePIN,
  onLogout,
  diningHours,
  emergencyContacts,
  onUpdateDiningHours,
  onUpdateEmergencyContacts
}: AdminDashboardProps) {
  const t = TRANSLATIONS[lang];

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | FeedbackCategory>('all');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Stats Calculations
  const stats = useMemo(() => {
    const total = submissions.length;
    if (total === 0) {
      return {
        total: 0,
        avgRating: 0,
        satisfactionRate: 0,
        pendingCount: 0,
        foodAvg: 0,
        cleaningAvg: 0,
        laundryAvg: 0,
        ratingWeights: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const ratingsSum = submissions.reduce((sum, s) => sum + s.rating, 0);
    const avgRating = ratingsSum / total;

    // Satisfied are ratings 4 & 5
    const satisfiedCount = submissions.filter(s => s.rating >= 4).length;
    const satisfactionRate = Math.round((satisfiedCount / total) * 100);

    const pendingCount = submissions.filter(s => s.status === 'pending').length;

    // Averages by category
    const foodItems = submissions.filter(s => s.category === 'food');
    const cleaningItems = submissions.filter(s => s.category === 'cleaning');
    const laundryItems = submissions.filter(s => s.category === 'laundry');

    const computeAvg = (items: FeedbackSubmission[]) => 
      items.length ? (items.reduce((sum, i) => sum + i.rating, 0) / items.length) : 0;

    // Distribution of star ratings
    const ratingWeights = {
      5: submissions.filter(s => s.rating === 5).length,
      4: submissions.filter(s => s.rating === 4).length,
      3: submissions.filter(s => s.rating === 3).length,
      2: submissions.filter(s => s.rating === 2).length,
      1: submissions.filter(s => s.rating === 1).length,
    };

    return {
      total,
      avgRating: Number(avgRating.toFixed(1)),
      satisfactionRate,
      pendingCount,
      foodAvg: Number(computeAvg(foodItems).toFixed(1)),
      cleaningAvg: Number(computeAvg(cleaningItems).toFixed(1)),
      laundryAvg: Number(computeAvg(laundryItems).toFixed(1)),
      ratingWeights
    };
  }, [submissions]);

  // Handle CSV Download
  const handleExportCSV = () => {
    if (submissions.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for proper Excel Arabic representation
    csvContent += "ID,Resident Name,Room,Category,Sub-category,Rating,Tags,Comment,Status,Date\n";

    submissions.forEach((s) => {
      const name = s.residentName || "Anonymous";
      const tags = s.tags.join("; ");
      const cleanComment = s.comment.replace(/"/g, '""'); // escape quotes
      const date = new Date(s.timestamp).toLocaleDateString();
      csvContent += `"${s.id}","${name}","${s.roomNumber}","${s.category}","${s.subCategory}",${s.rating},"${tags}","${cleanComment}","${s.status}","${date}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `camp_feedback_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Submissions
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      // 1. Search filter
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term || 
        s.roomNumber.toLowerCase().includes(term) ||
        (s.residentName && s.residentName.toLowerCase().includes(term)) ||
        s.comment.toLowerCase().includes(term) || 
        s.id.toLowerCase().includes(term);

      // 2. Category filter
      const matchesCategory = categoryFilter === 'all' || s.category === categoryFilter;

      // 3. Subcategory filter
      const matchesSubcategory = subcategoryFilter === 'all' || s.subCategory === subcategoryFilter;

      // 4. Rating filter
      const matchesRating = ratingFilter === 'all' || s.rating.toString() === ratingFilter;

      // 5. Status filter
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesRating && matchesStatus;
    });
  }, [submissions, searchTerm, categoryFilter, subcategoryFilter, ratingFilter, statusFilter]);

  // Emojis mapping for rating values
  const getRatingEmoji = (rate: number) => {
    if (rate >= 4.5) return '😍';
    if (rate >= 3.5) return '🙂';
    if (rate >= 2.5) return '😐';
    if (rate >= 1.5) return '☹️';
    return '😡';
  };

  const getStatusColor = (status: FeedbackSubmission['status']) => {
    switch (status) {
      case 'pending': return 'backdrop-blur-md bg-rose-500/10 text-rose-800 border-rose-300/40 font-bold';
      case 'reviewed': return 'backdrop-blur-md bg-amber-500/10 text-amber-800 border-amber-300/40 font-bold';
      case 'resolved': return 'backdrop-blur-md bg-emerald-500/10 text-emerald-800 border-emerald-300/40 font-bold';
    }
  };

  const getCategoryIcon = (category: FeedbackCategory) => {
    switch (category) {
      case 'food': return <Utensils size={14} className="text-indigo-500" />;
      case 'cleaning': return <Sparkles size={14} className="text-emerald-500" />;
      case 'laundry': return <Waves size={14} className="text-sky-500" />;
    }
  };

  const [isChangingPIN, setIsChangingPIN] = useState(false);
  const [newPINInput, setNewPINInput] = useState('');
  const [pinChangeError, setPinChangeError] = useState('');

  const [adminSubTab, setAdminSubTab] = useState<'feedback' | 'guide'>('feedback');

  // Editing state for dining
  const [editingDiningId, setEditingDiningId] = useState<string | null>(null);
  const [diningEditForm, setDiningEditForm] = useState<DiningItem | null>(null);

  // Editing state for contacts
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactEditForm, setContactEditForm] = useState<ContactItem | null>(null);

  const startEditDining = (meal: DiningItem) => {
    setEditingDiningId(meal.id);
    setDiningEditForm({ ...meal });
  };

  const handleSaveDining = () => {
    if (!diningEditForm) return;
    const updated = diningHours.map(m => m.id === editingDiningId ? diningEditForm : m);
    onUpdateDiningHours(updated);
    setEditingDiningId(null);
    setDiningEditForm(null);
  };

  const startEditContact = (contact: ContactItem) => {
    setEditingContactId(contact.id);
    setContactEditForm({ ...contact });
  };

  const handleSaveContact = () => {
    if (!contactEditForm) return;
    const updated = emergencyContacts.map(c => c.id === editingContactId ? contactEditForm : c);
    onUpdateEmergencyContacts(updated);
    setEditingContactId(null);
    setContactEditForm(null);
  };

  const handlePINChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPINInput.trim();
    if (!trimmed) {
      setPinChangeError(lang === 'ar' ? 'الرمز لا يمكن أن يكون فارغاً' : 'PIN cannot be empty');
      return;
    }
    if (trimmed.length < 4) {
      setPinChangeError(lang === 'ar' ? 'الرمز يجب أن يكون 4 خانات على الأقل لضمان الأمان!' : 'PIN must be at least 4 digits long!');
      return;
    }
    if (onChangePIN) {
      onChangePIN(trimmed);
      setNewPINInput('');
      setIsChangingPIN(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* ADMIN CONTROL BAR */}
      <div className="backdrop-blur-xl bg-slate-900/90 text-white border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
            <Lock size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-1.5 leading-none">
              <span>{lang === 'ar' ? 'إعدادات أمان وحماية لوحة التحكم' : 'Authorized Admin Settings'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                {lang === 'ar' ? 'آمن ومفعل 🔒' : 'Secure & Active 🔒'}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 mt-2 font-semibold">
              {lang === 'ar' 
                ? `الوصول للوحة مؤمن برمز مرور إداري الخاص بك` 
                : `Login access is protected. Authorized personnel only.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Change PIN form/button */}
          {isChangingPIN ? (
            <form onSubmit={handlePINChangeSubmit} className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 max-w-sm w-full">
              <div className="flex flex-col w-full">
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'الرمز الجديد (4 خانات أو أكثر)' : 'New PIN (4+ digits)'}
                  value={newPINInput}
                  onChange={(e) => {
                    setNewPINInput(e.target.value);
                    setPinChangeError('');
                  }}
                  className="bg-transparent text-white px-3 py-1.5 text-xs rounded-xl focus:outline-hidden font-mono w-full placeholder:text-slate-500"
                  autoFocus
                />
                {pinChangeError && (
                  <span className="text-[10px] text-red-400 font-bold px-3 pt-1">{pinChangeError}</span>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg transition-all shrink-0 cursor-pointer"
              >
                {lang === 'ar' ? 'حفظ' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPIN(false);
                  setNewPINInput('');
                  setPinChangeError('');
                }}
                className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold rounded-lg transition-all shrink-0 cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsChangingPIN(true)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1 hover:text-white"
            >
              <span>🔑</span>
              <span>{lang === 'ar' ? 'تغيير رمز المرور' : 'Change Passcode'}</span>
            </button>
          )}

          {/* Generate Mock Data Button */}
          <button
            onClick={onAddMockData}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:text-white"
          >
            <RefreshCw size={12} className="animate-spin-slow text-indigo-400" />
            <span>{t.mockDataBtn}</span>
          </button>

          {/* Secure lock exit */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl border border-rose-500/30 shadow-md hover:shadow-rose-500/10 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <span>🔒</span>
              <span>{lang === 'ar' ? 'خروج وتأمين لوحة التحكم' : 'Secure Lock & Exit'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Sub Tab Switcher */}
      <div className="flex justify-start gap-2 border-b border-indigo-950/5 pb-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <button
          type="button"
          onClick={() => setAdminSubTab('feedback')}
          className={`py-2 px-5 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
            adminSubTab === 'feedback'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.01]'
              : 'bg-white/60 text-slate-700 border-white/80 hover:bg-white hover:text-slate-950'
          }`}
        >
          <Home size={13} />
          <span>{lang === 'ar' ? 'لوحة تقييمات القاطنين ومؤشر الأداء' : 'Evaluations & Performance KPI'}</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSubTab('guide')}
          className={`py-2 px-5 rounded-xl font-black text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
            adminSubTab === 'guide'
              ? 'bg-amber-600 text-white border-amber-500 shadow-md transform scale-[1.01]'
              : 'bg-white/60 text-slate-700 border-white/80 hover:bg-white hover:text-slate-950'
          }`}
        >
          <Clock size={13} />
          <span>{lang === 'ar' ? 'تعديل توقيت صالة الطعام والأرقام الحيوية ⚙_️' : 'Edit Dining & Vital Contacts ⚙_️'}</span>
        </button>
      </div>

      {adminSubTab === 'feedback' ? (
        <>
          {/* 1. TOP OVERVIEW KPI GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total feedback card */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.totalFeedback}</span>
            <h3 className="text-3xl font-black text-slate-900 font-mono">{stats.total}</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {lang === 'ar' ? 'التقييمات التراكمية المسجلة' : 'Cumulative registered submissions'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-slate-800 shadow-sm">
            <Users size={24} />
          </div>
        </div>

        {/* Satisfaction Rate Card */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.overallSatisfaction}</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-emerald-650 font-mono">{stats.satisfactionRate}%</h3>
              <span className="text-xs font-black text-slate-600 bg-white/50 border border-white/40 px-1.5 py-0.5 rounded-lg">⭐ {stats.avgRating} / 5</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <ThumbsUp size={10} />
              <span>{lang === 'ar' ? 'ممتاز أو مرضي' : 'Satisfactory ratings (4+5)'}</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Active pending Issues */}
        <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.activeIssues}</span>
            <h3 className="text-3xl font-black text-rose-600 font-mono">{stats.pendingCount}</h3>
            <p className="text-[11px] text-rose-700 font-medium">
              {lang === 'ar' ? 'تحتاج مراجعة مباشرة' : 'Awaiting immediate feedback review'}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/40 border border-white/60 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Categories Quick Summary Bento */}
        <div className="backdrop-blur-xl bg-indigo-950/20 border border-indigo-200/50 rounded-3xl p-4 shadow-xl text-slate-900">
          <h4 className="text-xs font-black text-slate-500 uppercase mb-3 tracking-wider flex items-center gap-1">
            <Sparkle size={12} className="text-indigo-600 animate-pulse" />
            <span>{t.byCategory}</span>
          </h4>
          <div className="space-y-2">
            {/* Food line */}
            <div className="flex items-center justify-between text-xs py-1 border-b border-indigo-200/20">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">🍕 {t.food}</span>
              <span className="font-mono bg-white/50 text-indigo-900 border border-white px-2 py-0.5 rounded-lg font-black text-[10px] shadow-2xs">
                {stats.foodAvg} {getRatingEmoji(stats.foodAvg)}
              </span>
            </div>
            {/* Cleaning line */}
            <div className="flex items-center justify-between text-xs py-1 border-b border-indigo-200/20">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">🧼 {t.cleaning}</span>
              <span className="font-mono bg-white/50 text-emerald-900 border border-white px-2 py-0.5 rounded-lg font-black text-[10px] shadow-2xs">
                {stats.cleaningAvg} {getRatingEmoji(stats.cleaningAvg)}
              </span>
            </div>
            {/* Laundry line */}
            <div className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">👚 {t.laundry}</span>
              <span className="font-mono bg-white/50 text-sky-900 border border-white px-2 py-0.5 rounded-lg font-black text-[10px] shadow-2xs">
                {stats.laundryAvg} {getRatingEmoji(stats.laundryAvg)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SATISFACTION SPATIAL DISTRIBUTION CHART */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.byCategory}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'ar' ? 'عرض توزيع مستويات الرضا والوجوه التعبيرية للخدمات بمختلف الأقسام' : 'Distribution of satisfaction facial rates across all categories'}
            </p>
          </div>
          
          <button
            onClick={onAddMockData}
            className="px-4 py-2 text-xs font-semibold bg-amber-50 hover:bg-amber-140/80 text-amber-900 border border-amber-200 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>{t.mockDataBtn}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Visual Progress Bar Chart */}
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.ratingWeights[star as keyof typeof stats.ratingWeights] || 0;
              const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              
              // Determine emoji and color theme for different stars
              let emoji = '😍';
              let barColor = 'bg-emerald-500';
              if (star === 4) { emoji = '🙂'; barColor = 'bg-emerald-400'; }
              if (star === 3) { emoji = '😐'; barColor = 'bg-amber-400'; }
              if (star === 2) { emoji = '☹️'; barColor = 'bg-orange-400'; }
              if (star === 1) { emoji = '😡'; barColor = 'bg-red-500'; }

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center filter drop-shadow-xs">{emoji}</span>
                  <span className="text-xs font-bold text-slate-500 w-16 text-right">
                    {star} {star === 1 ? (lang === 'ar' ? 'نجمة' : 'Star') : (lang === 'ar' ? 'نجوم' : 'Stars')}
                  </span>
                  
                  {/* Progress Line */}
                  <div className="flex-1 h-3.5 bg-white/10 backdrop-blur-md rounded-full overflow-hidden border border-white/40 relative shadow-inner">
                    <div 
                      className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <span className="text-xs font-black text-slate-800 w-10 text-right font-mono">
                    {count} ({percent}%)
                  </span>
                </div>
              );
            })}
          </div>

          {/* Aesthetic Bento info cards representing each service with beautiful ratings gauge */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md text-center space-y-1 shadow-sm">
              <span className="text-2xl">🍲</span>
              <h5 className="font-extrabold text-xs text-indigo-950">{t.food}</h5>
              <div className="text-lg font-black text-indigo-900 font-mono mt-1">{stats.foodAvg} / 5</div>
              <div className="text-[10px] text-indigo-650 font-black">{getRatingEmoji(stats.foodAvg)} {lang === 'ar' ? 'ممتاز' : 'Superb'}</div>
            </div>

            <div className="p-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md text-center space-y-1 shadow-sm">
              <span className="text-2xl">🧼</span>
              <h5 className="font-extrabold text-xs text-emerald-950">{t.cleaning}</h5>
              <div className="text-lg font-black text-emerald-900 font-mono mt-1">{stats.cleaningAvg} / 5</div>
              <div className="text-[10px] text-emerald-650 font-black">{getRatingEmoji(stats.cleaningAvg)} {lang === 'ar' ? 'رائع' : 'Satisfied'}</div>
            </div>

            <div className="p-4 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-md text-center space-y-1 shadow-sm">
              <span className="text-2xl">👕</span>
              <h5 className="font-extrabold text-xs text-sky-950">{t.laundry}</h5>
              <div className="text-lg font-black text-sky-900 font-mono mt-1">{stats.laundryAvg} / 5</div>
              <div className="text-[10px] text-sky-650 font-black">{getRatingEmoji(stats.laundryAvg)} {lang === 'ar' ? 'ممتاز' : 'Excellent'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FILTER SYSTEM AND INTERACTIVE DATA LOG TABLE */}
      <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl shadow-xl overflow-hidden">
        {/* Log table head with export and filtering title */}
        <div className="p-6 border-b border-white/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900">{t.feedbackLog}</h3>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                {lang === 'ar' ? `تم تصفية ${filteredSubmissions.length} من أصل ${submissions.length} تقييمات مسجلة` : `Filtered ${filteredSubmissions.length} of ${submissions.length} log submissions`}
              </p>
            </div>
            
            <button
              onClick={handleExportCSV}
              disabled={filteredSubmissions.length === 0}
              className="py-3 px-5 bg-indigo-600/90 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black rounded-xl shadow-lg hover:shadow-indigo-500/10 border border-indigo-500/30 cursor-pointer transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto transform hover:-translate-y-0.5"
            >
              <Download size={14} />
              <span>{t.exportBtn}</span>
            </button>
          </div>

          {/* Search bar & Filter selections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Search inputs */}
            <div className="relative md:col-span-2">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-500 rtl:right-3 rtl:left-auto" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-9 pr-4 py-2.5 border border-white/60 bg-white/55 backdrop-blur-md focus:bg-white/85 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs text-slate-800 font-bold focus:outline-hidden rtl:pr-9 rtl:pl-4 transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute top-1/2 -translate-y-1/2 right-3 hover:text-slate-800 text-slate-500 rtl:left-3 rtl:right-auto text-xs"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Department filters */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as any);
                  setSubcategoryFilter('all'); // reset sub-category on main change
                }}
                className="w-full px-3 py-2.5 border border-white/60 bg-white/55 backdrop-blur-md focus:bg-white/85 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-black focus:outline-hidden transition-all text-slate-800 cursor-pointer shadow-2xs"
              >
                <option value="all">🌐 {t.allCategories}</option>
                <option value="food">🍱 {t.food}</option>
                <option value="cleaning">🧹 {t.cleaning}</option>
                <option value="laundry">👚 {t.laundry}</option>
              </select>
            </div>

            {/* Sub-category selector */}
            <div>
              <select
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-white/60 bg-white/55 backdrop-blur-md focus:bg-white/85 focus:ring-1 focus:ring-indigo-500/20 rounded-xl text-xs font-black focus:outline-hidden transition-all text-slate-800 cursor-pointer shadow-2xs"
              >
                <option value="all">ℹ️ {t.allSubcategories}</option>
                {categoryFilter === 'food' && (
                  <>
                    <option value="breakfast">🥐 {t.breakfast}</option>
                    <option value="lunch">🥘 {t.lunch}</option>
                    <option value="dinner">🥩 {t.dinner}</option>
                  </>
                )}
                {categoryFilter === 'cleaning' && (
                  <>
                    <option value="regular_cleaning">🧼 {t.regular_cleaning}</option>
                    <option value="deep_cleaning">🧹 {t.deep_cleaning}</option>
                  </>
                )}
                {categoryFilter === 'laundry' && (
                  <option value="general">👚 {t.general}</option>
                )}
              </select>
            </div>

            {/* Star ratings filters */}
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-white/60 bg-white/55 backdrop-blur-md focus:bg-white/85 focus:ring-1 focus:ring-indigo-500/20 rounded-xl text-xs font-black focus:outline-hidden transition-all text-slate-800 cursor-pointer shadow-2xs"
              >
                <option value="all">⭐ {t.filterByRating}</option>
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>
          </div>
        </div>

        {/* FEEDBACK LIST - RESPONSIVE MOBILE FLOW & DESKTOP TABLE */}
        {filteredSubmissions.length === 0 ? (
          <div className="py-16 px-6 text-center text-slate-500 space-y-3">
            <span className="text-4xl filter drop-shadow-xs">📭</span>
            <p className="text-sm font-bold">{t.noFeedbackFound}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <table className="w-full min-w-[900px] border-collapse text-left text-xs text-slate-600 hidden md:table bg-transparent">
              <thead className="bg-white/40 border-b border-white/50 text-[10px] font-black text-slate-700 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-center w-16">ID</th>
                  <th scope="col" className="px-5 py-3.5 rtl:text-right ltr:text-left">{t.roomLabel} & {t.residentName}</th>
                  <th scope="col" className="px-5 py-3.5 rtl:text-right ltr:text-left">{t.categoryLabel}</th>
                  <th scope="col" className="px-5 py-3.5 text-center">{t.ratingLabel}</th>
                  <th scope="col" className="px-5 py-3.5 rtl:text-right ltr:text-left w-1/3">{t.commentLabel}</th>
                  <th scope="col" className="px-5 py-3.5 text-center">{t.statusLabel}</th>
                  <th scope="col" className="px-5 py-3.5 text-center w-[150px]">{t.actionHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/30 bg-white/5 backdrop-blur-md">
                {filteredSubmissions.map((s) => {
                  let face = '😐';
                  if (s.rating === 1) face = '😡';
                  if (s.rating === 2) face = '☹️';
                  if (s.rating === 3) face = '😐';
                  if (s.rating === 4) face = '🙂';
                  if (s.rating === 5) face = '😍';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* ID */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-400 text-center text-[11px]">
                        {s.id}
                      </td>

                      {/* Room & Resident details */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5 font-mono">
                          <Home size={12} className="text-slate-400" />
                          <span>{s.roomNumber}</span>
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                          <User size={11} className="text-slate-350" />
                          <span>{s.residentName || (lang === 'ar' ? 'مجهول' : 'Anonymous')}</span>
                        </div>
                      </td>

                      {/* Category & subcategory badges */}
                      <td className="px-5 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700 capitalize">
                          {getCategoryIcon(s.category)}
                          <span>{t[s.category as keyof typeof t]}</span>
                        </div>
                        <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          {t[s.subCategory as keyof typeof t] || s.subCategory}
                        </span>
                      </td>

                      {/* Face Emoji Rating */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-2xl filter drop-shadow-xs mb-1">{face}</span>
                          <span className="font-bold text-[11px] font-mono text-slate-600">
                            {'⭐'.repeat(s.rating)}
                          </span>
                        </div>
                      </td>

                      {/* Comments & tags */}
                      <td className="px-5 py-4 space-y-2">
                        {s.comment ? (
                          <p className="text-slate-800 text-[13px] leading-relaxed break-words italic bg-white/55 backdrop-blur-md p-2.5 rounded-xl border border-white/60 font-sans shadow-2xs">
                            "{s.comment}"
                          </p>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">{lang === 'ar' ? 'بدون تعليق مكتوب' : 'No written remarks'}</span>
                        )}

                        {/* Selected tags list */}
                        {s.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {s.tags.map((tag, i) => (
                              <span 
                                key={i} 
                                className="text-[10px] bg-white/60 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-white/40 shadow-2xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 font-semibold">
                          <Clock size={10} />
                          <span>{new Date(s.timestamp).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-block border px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(s.status)}`}>
                          {t[s.status as keyof typeof t]}
                        </span>
                      </td>

                      {/* Dynamic action buttons */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {s.status === 'pending' && (
                            <button
                              title={t.markReviewed}
                              onClick={() => onStatusChange(s.id, 'reviewed')}
                              className="p-1 px-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-0.5"
                            >
                              <Eye size={12} />
                              <span>{t.markReviewed}</span>
                            </button>
                          )}
                          {(s.status === 'pending' || s.status === 'reviewed') && (
                            <button
                              title={t.markResolved}
                              onClick={() => onStatusChange(s.id, 'resolved')}
                              className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-0.5"
                            >
                              <Check size={12} />
                              <span>{t.markResolved}</span>
                            </button>
                          )}
                          <button
                            title={t.deleteBtn}
                            onClick={() => onDelete(s.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Mobile / Card List View */}
            <div className="md:hidden divide-y divide-white/20 bg-transparent">
              {filteredSubmissions.map((s) => {
                let face = '😐';
                if (s.rating === 1) face = '😡';
                if (s.rating === 2) face = '☹️';
                if (s.rating === 3) face = '😐';
                if (s.rating === 4) face = '🙂';
                if (s.rating === 5) face = '😍';

                return (
                  <div key={s.id} className="p-5 space-y-4 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
                    {/* Header: ID, Date, Room */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 font-mono">
                          <Home size={14} className="text-slate-500" />
                          <span>{s.roomNumber}</span>
                        </div>
                        <div className="text-slate-500 text-[10px] font-bold font-mono">{new Date(s.timestamp).toLocaleString()}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`inline-block border px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusColor(s.status)}`}>
                          {t[s.status as keyof typeof t]}
                        </span>
                        <div className="text-xs font-black text-slate-500 font-mono">
                          #{s.id}
                        </div>
                      </div>
                    </div>

                    {/* Resident Info & Rating emoji */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/35 border border-white/60 shadow-2xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">{t.residentName}</span>
                        <span className="text-xs font-black text-slate-700">{s.residentName || (lang === 'ar' ? 'مجهول' : 'Anonymous')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl filter drop-shadow-xs">{face}</span>
                        <span className="font-extrabold text-xs text-slate-700 font-mono">({s.rating} / 5)</span>
                      </div>
                    </div>

                    {/* Department */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold block">{t.categoryLabel}</span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 font-black text-xs text-slate-800 capitalize">
                          {getCategoryIcon(s.category)}
                          <span>{t[s.category as keyof typeof t]}</span>
                        </span>
                        <span className="text-[9px] bg-white/50 text-slate-700 border border-white/40 px-2 py-0.5 rounded-full font-black">
                          {t[s.subCategory as keyof typeof t] || s.subCategory}
                        </span>
                      </div>
                    </div>

                    {/* Comment text */}
                    {s.comment && (
                      <div className="p-3 bg-white/45 border border-white/60 rounded-xl shadow-2xs">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">{t.commentLabel}</span>
                        <p className="text-slate-800 text-xs italic leading-relaxed">"{s.comment}"</p>
                      </div>
                    )}

                    {/* Quick Tags tags list */}
                    {s.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {s.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            className="text-[9px] bg-white/60 text-slate-700 border border-white/40 font-bold px-2 py-0.5 rounded-full shadow-2xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions button block */}
                    <div className="pt-3 border-t border-white/30 flex items-center justify-between gap-2.5">
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-2 bg-white/30 hover:bg-red-500/10 hover:text-red-650 text-slate-500 border border-white/50 hover:border-red-200 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <Trash2 size={12} />
                        <span>{t.deleteBtn}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {s.status === 'pending' && (
                          <button
                            onClick={() => onStatusChange(s.id, 'reviewed')}
                            className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-200/55 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Eye size={12} />
                            <span>{t.markReviewed}</span>
                          </button>
                        )}
                        {(s.status === 'pending' || s.status === 'reviewed') && (
                          <button
                            onClick={() => onStatusChange(s.id, 'resolved')}
                            className="p-2 bg-emerald-600/90 hover:bg-emerald-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1 shadow-md hover:shadow-emerald-500/10"
                          >
                            <Check size={12} />
                            <span>{t.markResolved}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
    ) : (
      <div className="space-y-6 animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="backdrop-blur-xl bg-white/40 border border-white/60 p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 bg-amber-600/10 text-amber-700 rounded-2xl flex-shrink-0">
              <Clock size={36} className="animate-pulse" />
            </div>
            <div className="space-y-1 text-center sm:text-right flex-1">
              <h3 className="text-lg font-black text-slate-900">
                {lang === 'ar' ? 'لوحة التحكم في المواعيد والأرقام' : 'Guide Details Configurator'}
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed font-sans mt-1">
                {lang === 'ar'
                  ? 'قم بتحديث مواعيد وجبات الفطور والغداء والعشاء، أو تعديل أرقام الهواتف وخط الطوارئ مباشرة للزوار والقاطنين.'
                  : 'Modify operating hours and vital contact numbers instantly. All changes reflect in real-time on the main page.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Dining hours list & inline editor */}
            <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-indigo-950/5">
                <Utensils size={18} className="text-indigo-600" />
                <h4 className="text-base font-black text-slate-900">
                  {lang === 'ar' ? '🍔 تعديل مواعيد صالة الطعام والوجبات' : '🍔 Edit Dining Hours'}
                </h4>
              </div>

              <div className="space-y-4">
                {diningHours.map((meal) => {
                  const isEditing = editingDiningId === meal.id;
                  return (
                    <div
                      key={meal.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isEditing 
                          ? 'bg-white border-indigo-350 shadow-md ring-2 ring-indigo-500/10' 
                          : 'bg-white/20 border-white/80 hover:bg-white/40'
                      }`}
                    >
                      {isEditing && diningEditForm ? (
                        <div className="space-y-4 font-sans text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'العنوان بالعربية' : 'Title (Arabic)'}
                              </label>
                              <input
                                type="text"
                                value={diningEditForm.titleAr}
                                onChange={(e) => setDiningEditForm({ ...diningEditForm, titleAr: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-950"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'العنوان بالإنجليزية' : 'Title (English)'}
                              </label>
                              <input
                                type="text"
                                value={diningEditForm.titleEn}
                                onChange={(e) => setDiningEditForm({ ...diningEditForm, titleEn: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-950"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'الوقت بالعربية' : 'Time (Arabic)'}
                              </label>
                              <input
                                type="text"
                                value={diningEditForm.timeAr}
                                onChange={(e) => setDiningEditForm({ ...diningEditForm, timeAr: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-950"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'الوقت بالإنجليزية' : 'Time (English)'}
                              </label>
                              <input
                                type="text"
                                value={diningEditForm.timeEn}
                                onChange={(e) => setDiningEditForm({ ...diningEditForm, timeEn: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-950"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">
                              {lang === 'ar' ? 'الوصف بالعربية' : 'Description (Arabic)'}
                            </label>
                            <textarea
                              rows={2}
                              value={diningEditForm.descAr}
                              onChange={(e) => setDiningEditForm({ ...diningEditForm, descAr: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-950"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">
                              {lang === 'ar' ? 'الوصف بالإنجليزية' : 'Description (English)'}
                            </label>
                            <textarea
                              rows={2}
                              value={diningEditForm.descEn}
                              onChange={(e) => setDiningEditForm({ ...diningEditForm, descEn: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-955"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={handleSaveDining}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black rounded-lg cursor-pointer transform active:scale-95 transition-all shadow-xs flex items-center gap-1"
                            >
                              <Check size={12} />
                              <span>{lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingDiningId(null);
                                setDiningEditForm(null);
                              }}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transform active:scale-95 transition-all"
                            >
                              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center gap-4">
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-950 text-xs md:text-sm">
                              {lang === 'ar' ? meal.titleAr : meal.titleEn}
                            </h5>
                            <p className="text-[11px] text-indigo-700 font-bold font-mono">
                              ⏱️ {lang === 'ar' ? meal.timeAr : meal.timeEn}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm mt-1">
                              {lang === 'ar' ? meal.descAr : meal.descEn}
                            </p>
                          </div>

                          <button
                            onClick={() => startEditDining(meal)}
                            className="p-2.5 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-xl transition-all cursor-pointer flex-shrink-0"
                            title={lang === 'ar' ? 'تعديل هذا الموعد' : 'Edit this schedule'}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emergency & vital contacts list & inline editor */}
            <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-rose-950/5">
                <Phone size={18} className="text-rose-600" />
                <h4 className="text-base font-black text-slate-900">
                  {lang === 'ar' ? '📞 تعديل دليل أرقام التواصل والعيادة' : '📞 Edit Vital Contacts'}
                </h4>
              </div>

              <div className="space-y-4">
                {emergencyContacts.map((contact) => {
                  const isEditing = editingContactId === contact.id;
                  return (
                    <div
                      key={contact.id}
                      className={`p-4 rounded-2xl border transition-all duration-300 ${
                        isEditing 
                          ? 'bg-white border-rose-300 shadow-md ring-2 ring-rose-500/10' 
                          : contact.urgent
                            ? 'bg-rose-50/50 border-rose-100 hover:bg-rose-50/80 shadow-xs'
                            : 'bg-white/20 border-white/80 hover:bg-white/40'
                      }`}
                    >
                      {isEditing && contactEditForm ? (
                        <div className="space-y-4 font-sans text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'طاقم الخدمة بالعربية' : 'Title/Service (Arabic)'}
                              </label>
                              <input
                                type="text"
                                value={contactEditForm.nameAr}
                                onChange={(e) => setContactEditForm({ ...contactEditForm, nameAr: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-950"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'طاقم الخدمة بالإنجليزية' : 'Title/Service (English)'}
                              </label>
                              <input
                                type="text"
                                value={contactEditForm.nameEn}
                                onChange={(e) => setContactEditForm({ ...contactEditForm, nameEn: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-955"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'الرقم الرئيسي الساخن' : 'Primary Number'}
                              </label>
                              <input
                                type="text"
                                value={contactEditForm.number}
                                onChange={(e) => setContactEditForm({ ...contactEditForm, number: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-950"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 block">
                                {lang === 'ar' ? 'الرقم الإضافي أو الخارجي (اختياري)' : 'Sub Number (Optional)'}
                              </label>
                              <input
                                type="text"
                                value={contactEditForm.subNumber || ''}
                                onChange={(e) => setContactEditForm({ ...contactEditForm, subNumber: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-955"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">
                              {lang === 'ar' ? 'تفاصيل الخدمة بالعربية' : 'Description (Arabic)'}
                            </label>
                            <textarea
                              rows={2}
                              value={contactEditForm.descAr}
                              onChange={(e) => setContactEditForm({ ...contactEditForm, descAr: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-950"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">
                              {lang === 'ar' ? 'تفاصيل الخدمة بالإنجليزية' : 'Description (English)'}
                            </label>
                            <textarea
                              rows={2}
                              value={contactEditForm.descEn}
                              onChange={(e) => setContactEditForm({ ...contactEditForm, descEn: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-955"
                            />
                          </div>

                          <div className="flex items-center gap-2 py-1 bg-rose-50/50 p-2 rounded-xl">
                            <input
                              type="checkbox"
                              id={`urgent-edit-${contact.id}`}
                              checked={contactEditForm.urgent}
                              onChange={(e) => setContactEditForm({ ...contactEditForm, urgent: e.target.checked })}
                              className="w-4 h-4 rounded-md border-rose-300 text-rose-600 focus:ring-rose-500/20"
                            />
                            <label htmlFor={`urgent-edit-${contact.id}`} className="text-xs font-extrabold text-rose-950 block cursor-pointer">
                              🚨 {lang === 'ar' ? 'أولوية قصوى وخط أحمر للطوارئ' : 'Urgent high-priority hotline indicator'}
                            </label>
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={handleSaveContact}
                              className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white text-[11px] font-black rounded-lg cursor-pointer transform active:scale-95 transition-all shadow-xs flex items-center gap-1"
                            >
                              <Check size={12} />
                              <span>{lang === 'ar' ? 'حفظ الرقم' : 'Save Contact'}</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditingContactId(null);
                                setContactEditForm(null);
                              }}
                              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded-lg cursor-pointer transform active:scale-95 transition-all"
                            >
                              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center gap-4">
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-950 text-xs md:text-sm flex items-center gap-1.5">
                              <span>{lang === 'ar' ? contact.nameAr : contact.nameEn}</span>
                              {contact.urgent && (
                                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[8px] font-black rounded-md uppercase animate-pulse">
                                  {lang === 'ar' ? 'طوارئ عاجلة' : 'Urgent'}
                                </span>
                              )}
                            </h5>
                            <p className="text-xs font-black text-rose-650 font-mono mt-0.5">
                              📞 {contact.number} {contact.subNumber && `| ${contact.subNumber}`}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed max-w-sm mt-1">
                              {lang === 'ar' ? contact.descAr : contact.descEn}
                            </p>
                          </div>

                          <button
                            onClick={() => startEditContact(contact)}
                            className="p-2.5 bg-rose-600/10 hover:bg-rose-650 text-rose-700 hover:text-white rounded-xl transition-all cursor-pointer flex-shrink-0"
                            title={lang === 'ar' ? 'تعديل بيانات الاتصال' : 'Edit contact detail'}
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
