/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FeedbackCategory, FeedbackSubCategory, Language, FeedbackSubmission } from '../types';
import { CATEGORY_TAGS, TRANSLATIONS } from '../data';
import { 
  Utensils, 
  Sparkles, 
  Waves, 
  Send, 
  CheckCircle2, 
  User, 
  Home, 
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

interface ResidentFormProps {
  lang: Language;
  onSubmit: (feedback: Omit<FeedbackSubmission, 'id' | 'timestamp' | 'status'>) => void;
  onNavigateToDashboard?: () => void;
}

export default function ResidentForm({ lang, onSubmit, onNavigateToDashboard }: ResidentFormProps) {
  const t = TRANSLATIONS[lang];

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>('food');
  const [subCategory, setSubCategory] = useState<FeedbackSubCategory>('breakfast');
  const [rating, setRating] = useState<number>(0); // 1-5 corresponding to the 5 smiley faces
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [residentName, setResidentName] = useState<string>('');
  
  // Validation and UI states
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // When changing category, adjust default sub-category and clear selected tags
  const handleCategoryChange = (cat: FeedbackCategory) => {
    setCategory(cat);
    setSelectedTags([]);
    if (cat === 'food') {
      setSubCategory('breakfast');
    } else if (cat === 'cleaning') {
      setSubCategory('regular_cleaning');
    } else {
      setSubCategory('general');
    }
  };

  const toggleTag = (tagLabel: string) => {
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter(t => t !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };

  const handleFaceClick = (r: number) => {
    setRating(r);
    setShowError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isRoomRequired = category !== 'food';
    if ((isRoomRequired && !roomNumber.trim()) || rating === 0) {
      setShowError(true);
      return;
    }

    onSubmit({
      residentName: residentName.trim() || undefined,
      roomNumber: isRoomRequired ? roomNumber.trim().toUpperCase() : 'N/A',
      category,
      subCategory,
      rating,
      tags: selectedTags,
      comment: comment.trim()
    });

    setSubmitted(true);
    setShowError(false);
  };

  const resetForm = () => {
    setRating(0);
    setSelectedTags([]);
    setComment('');
    setRoomNumber('');
    setResidentName('');
    setSubmitted(false);
  };

  // Smiley Rating Faces Array
  const faces = [
    { value: 1, emoji: '😡', labelAr: 'سيء جداً', labelEn: 'Terrible', color: 'hover:bg-red-55 text-red-600' },
    { value: 2, emoji: '☹️', labelAr: 'غير مرضي', labelEn: 'Unsatisfying', color: 'hover:bg-orange-55 text-orange-600' },
    { value: 3, emoji: '😐', labelAr: 'مقبول', labelEn: 'Neutral', color: 'hover:bg-amber-55 text-amber-600' },
    { value: 4, emoji: '🙂', labelAr: 'مرضي', labelEn: 'Satisfying', color: 'hover:bg-emerald-55 text-emerald-600' },
    { value: 5, emoji: '😍', labelAr: 'ممتاز جداً', labelEn: 'Exceptional', color: 'hover:bg-indigo-55 text-indigo-600' }
  ];

  const currentCategoryTags = CATEGORY_TAGS[category][lang];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {submitted ? (
        // Submission Success Screen
        <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl shadow-xl p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[460px] animate-badge-bounce">
          <div className="w-20 h-20 bg-white/60 rounded-full flex items-center justify-center text-emerald-600 mb-6 border border-white shadow-lg animate-pulse">
            <CheckCircle2 size={48} className="stroke-[2.5]" />
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
            {t.successTitle}
          </h2>
          
          <p className="text-slate-700 max-w-md mx-auto mb-8 text-base md:text-lg leading-relaxed font-sans font-medium">
            {t.successSub}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              onClick={resetForm}
              className="py-3.5 px-8 bg-indigo-600/90 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg border border-indigo-500/40 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Send size={18} />
              <span>{t.newFeedbackBtn}</span>
            </button>
            {onNavigateToDashboard && (
              <button
                onClick={onNavigateToDashboard}
                className="py-3.5 px-8 bg-white/45 hover:bg-white/65 text-slate-800 border border-white font-bold rounded-2xl shadow-sm transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5"
              >
                {t.adminPanel}
              </button>
            )}
          </div>
        </div>
      ) : (
        // Submission Form Screen
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Category Selectors */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {/* Food Card */}
            <button
              type="button"
              onClick={() => handleCategoryChange('food')}
              className={`p-4 rounded-3xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer backdrop-blur-xl ${
                category === 'food'
                  ? 'border-white bg-white/60 shadow-lg text-indigo-950 ring-2 ring-indigo-500/10'
                  : 'border-white/40 bg-white/20 hover:bg-white/40 text-slate-700 hover:text-slate-900 shadow-xs'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${category === 'food' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/30 text-slate-600'}`}>
                <Utensils size={24} />
              </div>
              <span className="font-bold text-sm md:text-base">{t.food}</span>
              <span className="text-[10px] md:text-xs text-slate-500 font-semibold hidden sm:block">
                {t.breakfast} / {t.lunch} / {t.dinner}
              </span>
            </button>

            {/* Cleaning Card */}
            <button
              type="button"
              onClick={() => handleCategoryChange('cleaning')}
              className={`p-4 rounded-3xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer backdrop-blur-xl ${
                category === 'cleaning'
                  ? 'border-white bg-white/60 shadow-lg text-emerald-950 ring-2 ring-emerald-500/10'
                  : 'border-white/40 bg-white/20 hover:bg-white/40 text-slate-700 hover:text-slate-900 shadow-xs'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${category === 'cleaning' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white/30 text-slate-600'}`}>
                <Sparkles size={24} />
              </div>
              <span className="font-bold text-sm md:text-base">{t.cleaning}</span>
              <span className="text-[10px] md:text-xs text-slate-500 font-semibold hidden sm:block">
                {t.regular_cleaning} / {t.deep_cleaning}
              </span>
            </button>

            {/* Laundry Card */}
            <button
              type="button"
              onClick={() => handleCategoryChange('laundry')}
              className={`p-4 rounded-3xl border text-center transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer backdrop-blur-xl ${
                category === 'laundry'
                  ? 'border-white bg-white/60 shadow-lg text-indigo-950 ring-2 ring-indigo-500/15'
                  : 'border-white/40 bg-white/20 hover:bg-white/40 text-slate-700 hover:text-slate-900 shadow-xs'
              }`}
            >
              <div className={`p-3 rounded-2xl transition-all duration-300 ${category === 'laundry' ? 'bg-sky-600 text-white shadow-md' : 'bg-white/30 text-slate-600'}`}>
                <Waves size={24} />
              </div>
              <span className="font-bold text-sm md:text-base">{t.laundry}</span>
              <span className="text-[10px] md:text-xs text-slate-500 font-semibold hidden sm:block">
                {t.general} feedback
              </span>
            </button>
          </div>

          {/* Subcategory selectors based on main category */}
          <div className="backdrop-blur-xl bg-white/25 rounded-3xl p-5 border border-white/40 shadow-sm">
            <label className="block text-xs font-bold text-slate-500 mb-3.5 uppercase tracking-wider">
              {category === 'food' ? t.food : category === 'cleaning' ? t.cleaning : t.laundry} - {t.subcategoryLabel}
            </label>
            
            <div className="flex flex-wrap gap-2.5">
              {category === 'food' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('breakfast')}
                    className={`px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 border flex items-center gap-1.5 shadow-sm transform active:scale-95 cursor-pointer ${
                      subCategory === 'breakfast'
                        ? 'bg-indigo-600 text-white border-indigo-650 shadow-indigo-200 shadow-md scale-[1.03] ring-4 ring-indigo-500/15'
                        : 'bg-white/45 text-slate-700 border-white/60 hover:bg-white/75 hover:text-slate-900'
                    }`}
                  >
                    <span>🥐</span>
                    <span>{t.breakfast}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategory('lunch')}
                    className={`px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 border flex items-center gap-1.5 shadow-sm transform active:scale-95 cursor-pointer ${
                      subCategory === 'lunch'
                        ? 'bg-indigo-600 text-white border-indigo-650 shadow-indigo-200 shadow-md scale-[1.03] ring-4 ring-indigo-500/15'
                        : 'bg-white/45 text-slate-700 border-white/60 hover:bg-white/75 hover:text-slate-900'
                    }`}
                  >
                    <span>🥘</span>
                    <span>{t.lunch}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategory('dinner')}
                    className={`px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 border flex items-center gap-1.5 shadow-sm transform active:scale-95 cursor-pointer ${
                      subCategory === 'dinner'
                        ? 'bg-indigo-600 text-white border-indigo-650 shadow-indigo-200 shadow-md scale-[1.03] ring-4 ring-indigo-500/15'
                        : 'bg-white/45 text-slate-700 border-white/60 hover:bg-white/75 hover:text-slate-900'
                    }`}
                  >
                    <span>🥩</span>
                    <span>{t.dinner}</span>
                  </button>
                </>
              )}

              {category === 'cleaning' && (
                <>
                  <button
                    type="button"
                    onClick={() => setSubCategory('regular_cleaning')}
                    className={`px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 border flex items-center gap-1.5 shadow-sm transform active:scale-95 cursor-pointer ${
                      subCategory === 'regular_cleaning'
                        ? 'bg-emerald-600 text-white border-emerald-650 shadow-emerald-200 shadow-md scale-[1.03] ring-4 ring-emerald-500/15'
                        : 'bg-white/45 text-slate-700 border-white/60 hover:bg-white/75 hover:text-slate-900'
                    }`}
                  >
                    <span>🧼</span>
                    <span>{t.regular_cleaning}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubCategory('deep_cleaning')}
                    className={`px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 border flex items-center gap-1.5 shadow-sm transform active:scale-95 cursor-pointer ${
                      subCategory === 'deep_cleaning'
                        ? 'bg-emerald-600 text-white border-emerald-650 shadow-emerald-200 shadow-md scale-[1.03] ring-4 ring-emerald-500/15'
                        : 'bg-white/45 text-slate-700 border-white/60 hover:bg-white/75 hover:text-slate-900'
                    }`}
                  >
                    <span>🧹</span>
                    <span>{t.deep_cleaning}</span>
                  </button>
                </>
              )}

              {category === 'laundry' && (
                <button
                  type="button"
                  className="px-5 py-3 rounded-2xl text-sm font-black bg-cyan-600 text-white border border-cyan-650 shadow-md flex items-center gap-1.5 pointer-events-none"
                >
                  <span>👚</span>
                  <span>{t.general}</span>
                </button>
              )}
            </div>
          </div>

          {/* EMOJI FACES - RATING SECTION */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-6 md:p-8 shadow-xl">
            <h3 className="text-lg md:text-xl font-black text-slate-900 text-center mb-6">
              {t.ratingPrompt}
            </h3>

            <div className="grid grid-cols-5 gap-2.5 max-w-md mx-auto mb-3">
              {faces.map((f) => {
                const isSelected = rating === f.value;
                const isHovered = hoverRating === f.value;
                
                let activeStyle = '';
                if (isSelected) {
                  if (f.value <= 2) activeStyle = 'bg-rose-500/80 border-white text-white scale-105 shadow-md backdrop-blur-md';
                  else if (f.value === 3) activeStyle = 'bg-amber-500/80 border-white text-white scale-105 shadow-md backdrop-blur-md';
                  else activeStyle = 'bg-emerald-600/80 border-white text-white scale-105 shadow-md backdrop-blur-md';
                } else {
                  activeStyle = 'bg-white/15 border-white/30 text-slate-800 hover:scale-[1.03] hover:bg-white/40';
                }

                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => handleFaceClick(f.value)}
                    onMouseEnter={() => setHoverRating(f.value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 cursor-pointer ${activeStyle}`}
                  >
                    <span className="text-3xl md:text-4xl mb-1.5 filter drop-shadow-xs">{f.emoji}</span>
                    <span className={`text-[10px] md:text-xs font-black tracking-tight leading-none ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                      {lang === 'ar' ? f.labelAr : f.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {showError && rating === 0 && (
              <div className="text-red-600 text-sm text-center mt-3 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                <AlertCircle size={16} />
                <span>الرجاء اختيار أحد مستويات الرضا (الوجوه التعبيرية)</span>
              </div>
            )}
          </div>

          {/* DYNAMIC FEEDBACK QUICK TAGS */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-6 shadow-xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              {t.tagsPrompt}
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {currentCategoryTags.map((tag, idx) => {
                const isSelected = selectedTags.includes(tag.label);
                
                let tagTheme = '';
                if (isSelected) {
                  tagTheme = tag.type === 'positive' 
                    ? 'bg-emerald-600/90 text-white border-white shadow-sm backdrop-blur-md'
                    : 'bg-rose-600/90 text-white border-white shadow-sm backdrop-blur-md';
                } else {
                  tagTheme = tag.type === 'positive'
                    ? 'bg-emerald-500/15 text-emerald-950 border-emerald-500/10 hover:bg-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-950 border-rose-500/10 hover:bg-rose-500/30';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTag(tag.label)}
                    className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold border border-transparent transition-all duration-200 cursor-pointer ${tagTheme}`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ROOM & NAME INFO FIELDS */}
          <div className={`grid grid-cols-1 ${category !== 'food' ? 'sm:grid-cols-2' : ''} gap-4`}>
            {/* Room Number */}
            {category !== 'food' && (
              <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-5 shadow-lg">
                <label htmlFor="room" className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Home size={16} className="text-indigo-600" />
                  <span>{t.roomNumber} <span className="text-red-500">*</span></span>
                </label>
                <input
                  id="room"
                  type="text"
                  required
                  value={roomNumber}
                  onChange={(e) => {
                    setRoomNumber(e.target.value);
                    if (e.target.value) setShowError(false);
                  }}
                  placeholder={t.roomPlaceholder}
                  className={`w-full px-4 py-2.5 rounded-2xl border font-mono placeholder:font-sans focus:outline-hidden focus:ring-2 transition-all ${
                    showError && !roomNumber.trim()
                      ? 'border-red-400 bg-red-50/40 focus:ring-red-100'
                      : 'border-white/60 bg-white/55 placeholder:text-slate-400 focus:bg-white/85 focus:ring-indigo-500/20'
                  }`}
                />
                {showError && !roomNumber.trim() && (
                  <span className="text-xs text-red-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{t.requiredField}</span>
                  </span>
                )}
              </div>
            )}

            {/* Resident Name (Optional) */}
            <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-5 shadow-lg">
              <label htmlFor="name" className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <User size={16} className="text-emerald-600" />
                <span>{t.residentName}</span>
              </label>
              <input
                id="name"
                type="text"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full px-4 py-2.5 rounded-2xl border border-white/60 bg-white/55 placeholder:text-slate-400 focus:bg-white/85 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all text-slate-900"
              />
            </div>
          </div>

          {/* COMMENT SECTION */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/50 rounded-3xl p-6 shadow-xl">
            <label htmlFor="comment" className="block text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <MessageSquare size={16} className="text-amber-500" />
              <span>{t.commentPrompt}</span>
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.commentPlaceholder}
              className="w-full px-4 py-3 border border-white/60 bg-white/55 placeholder:text-slate-400 focus:bg-white/85 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden rounded-2xl transition-all resize-y text-slate-900 font-medium"
            />
          </div>

          {/* EXPLANATORY DISCLAIMER */}
          <div className="backdrop-blur-lg bg-indigo-900/10 border border-indigo-200 rounded-2xl p-4 text-indigo-950 text-xs flex items-start gap-2.5 leading-relaxed font-semibold shadow-sm">
            <HelpCircle size={16} className="shrink-0 text-indigo-600 mt-0.5" />
            <p>
              {lang === 'ar' 
                ? 'تقييماتك تذهب مباشرة بشكل سري وفوري لفريق إدارة وتطوير الكامب. نعمل على مدار الساعة لمعالجة أي خلل أو خدمة ينخفض تقييمها عن المستوى المطلوب.'
                : 'Your feedback goes directly and confidentially to the camp management team. We work around the clock to audit and resolve any services scoring below our standard.'}
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-4 bg-indigo-650/95 hover:bg-indigo-700/95 text-white font-black rounded-3xl shadow-xl hover:shadow-indigo-500/20 border border-white/20 font-sans tracking-wide transition-all duration-300 transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send size={18} />
            <span>{t.submitBtn}</span>
          </button>
        </form>
      )}
    </div>
  );
}
